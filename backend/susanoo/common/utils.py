import logging
import os
import subprocess
import tempfile
import threading
from concurrent import futures
from typing import List
from datetime import datetime

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import models, transaction
from django.db.models import Q, Count
from langchain_core.messages import BaseMessage

from rasengan.commons.dataclasses import GenerationResponse, TokenUsage
from rasengan.graph.enums import NodeType
from rasengan.graph.models import NodeV2, EdgeV2, ConditionalEdgeV2, ForceEdge, GraphV2
from susanoo.message.enums import SentinelType
from susanoo.stage.enums import Module
from susanoo.stage.models import StageV2
from susanoo.interview.models import InterviewV2
from typing import Dict

logger = logging.getLogger(__file__)


def value_to_enum(enum: models.enums.ChoicesMeta, value: str):
    return enum._value2member_map_.get(value)


def to_camel_case(snake_str):
    return " ".join(x.capitalize() for x in snake_str.lower().split("_"))


def parse_generation(input: str, response: BaseMessage) -> GenerationResponse:
    metadata = response.response_metadata
    metadata['additional_kwargs'] = response.additional_kwargs

    token_usage = TokenUsage(
        input_tokens=response.response_metadata.get('token_usage').get('prompt_tokens'),
        output_tokens=response.response_metadata.get('token_usage').get('completion_tokens'),
        total_tokens=response.response_metadata.get('token_usage').get('total_tokens')
    )

    return GenerationResponse(
        id=response.id,
        name=response.name,
        type=response.type,
        usage=token_usage,
        input=input,
        raw_output=response.content,
        output=response.content,
        metadata=metadata
    )


def encoding_to_container(encoding: str) -> str:
    # Dictionary mapping encoding to container
    encoding_to_container_dict = {
        "linear16": "wav",
        "mulaw": "wav",
        "alaw": "wav",
        "mp3": None,
        "opus": "ogg",
        "flac": None,
        "aac": None
    }
    return encoding_to_container_dict.get(encoding)


def encoding_to_extension(encoding: str) -> str:
    # Dictionary mapping encoding to file extension
    encoding_to_extension_dict = {
        "linear16": "wav",
        "mulaw": "wav",
        "alaw": "wav",
        "mp3": "mp3",
        "opus": "ogg",
        "flac": "flac",
        "aac": "aac"
    }
    return encoding_to_extension_dict.get(encoding)


@transaction.atomic
def create_interview_graph(stages: List[StageV2]):
    # selected_stages = StageV2.objects.filter(
    #     Q(module=Module.BASE) &
    #     (
    #         Q(code__in=stages) |
    #         Q(required=True)
    #     )
    # ).order_by('stage_id')
    selected_stages = StageV2.objects.filter(
        id__in=[stage.id for stage in stages]
    ).order_by('stage_id')

    start_sentinel = NodeV2.objects.get(stage__module=Module.BASE, stage__code='INTRODUCTION', type=NodeType.SENTINEL,
                                        sentinel_type=SentinelType.START)  # assuming 1 start sentinel per module
    base_supervisor = NodeV2.objects.get(stage__module=Module.BASE,
                                         type=NodeType.SUPERVISOR)  # assuming only 1 supervisor per module
    base_io = NodeV2.objects.get(stage__module=Module.BASE, type=NodeType.IO)  # assuming only 1 io per module
    end_sentinel = NodeV2.objects.get(stage__module=Module.BASE, type=NodeType.SENTINEL, stage__code='END',
                                      sentinel_type=SentinelType.END)  # assuming 1 start sentinel per module

    intro_node = NodeV2.objects.get(stage__module=Module.BASE, stage__code='INTRODUCTION', type=NodeType.WORKER)
    end_node = NodeV2.objects.get(stage__module=Module.BASE, stage__code='END', type=NodeType.WORKER)

    # graph_nodes = [
    #     start_sentinel,
    #     base_supervisor,
    #     base_io,
    #     end_sentinel,
    #     # intro_node,
    #     end_node
    # ]

    graph_edges = []
    graph_conditional_edges = []
    graph_force_edges = []

    first_node = None
    last_node = None

    all_stages = [intro_node.stage]
    all_stages.extend(list(selected_stages))
    print("starting stages")
    for stage in all_stages:
        logger.info(f"[GraphCreator] Creating for stage: {stage}")
        node = stage.stage_nodes_v2.filter(type=NodeType.WORKER).first()  # there should be only one worker node
        logger.info(f"[GraphCreator] Got worker node: {node}")

        if not node:  # it is a subgraph
            logger.info(f"[GraphCreator] Worker node not found looking for sentinal")
            try:
                node = stage.stage_nodes_v2.filter(type=NodeType.SENTINEL).first()
                logger.info(f"[GraphCreator] Got sentinal {node}")
            except NodeV2.DoesNotExist:
                node = None
                logger.info(f"[GraphCreator] Sentinal not found")
            if node:
                # graph_nodes.append(node)
                sentinel_edge, _ = ConditionalEdgeV2.objects.get_or_create(start_node=base_supervisor, end_node=node,
                                                                           condition=stage.stage_id)
                graph_conditional_edges.append(sentinel_edge)
        else:
            io_edge, _ = EdgeV2.objects.get_or_create(start_node=node, end_node=base_io)
            supervisor_edge, _ = EdgeV2.objects.get_or_create(start_node=base_io, end_node=base_supervisor)
            worker_edge, _ = ConditionalEdgeV2.objects.get_or_create(start_node=base_supervisor, end_node=node,
                                                                     condition=stage.stage_id)

            graph_edges.append(io_edge)
            graph_edges.append(supervisor_edge)
            graph_conditional_edges.append(worker_edge)

        if not node:
            continue

        # graph_nodes.append(node)
        if first_node is None:
            first_node = node
        if last_node:
            force_edge, _ = ForceEdge.objects.get_or_create(start_node=last_node, end_node=node)
            graph_force_edges.append(force_edge)
        last_node = node

        if stage.submodule:
            logger.info(f"[GraphCreator] Found submodule stage: {stage.submodule}")
            module_nodes = NodeV2.objects.filter(
                Q(stage__module=stage.submodule)
            )
            module_edges = EdgeV2.objects.filter(
                Q(start_node__in=module_nodes, end_node__in=module_nodes) |
                Q(start_node__in=module_nodes, end_node=node) |
                Q(start_node=node, end_node__in=module_nodes)
            )
            module_conditional_edges = ConditionalEdgeV2.objects.filter(
                Q(start_node__in=module_nodes, end_node__in=module_nodes) |
                Q(start_node__in=module_nodes, end_node=node) |
                Q(start_node=node, end_node__in=module_nodes)
            )
            module_force_edges = ForceEdge.objects.filter(
                Q(start_node__in=module_nodes, end_node__in=module_nodes) |
                Q(start_node__in=module_nodes, end_node=node) |
                Q(start_node=node, end_node__in=module_nodes)
            )

            logger.info(f"[GraphCreator] Found submodule nodes: {module_nodes}")
            logger.info(f"[GraphCreator] Found submodule edges: {module_edges}")
            logger.info(f"[GraphCreator] Found submodule conditional edges: {module_conditional_edges}")
            logger.info(f"[GraphCreator] Found submodule force edges: {module_force_edges}")

            graph_edges.extend(module_edges)
            graph_force_edges.extend(module_force_edges)
            graph_conditional_edges.extend(module_conditional_edges)

    start_edge, _ = EdgeV2.objects.get_or_create(start_node=start_sentinel, end_node=first_node)
    final_edge, _ = EdgeV2.objects.get_or_create(start_node=end_node, end_node=end_sentinel)
    final_force_edge, _ = ForceEdge.objects.get_or_create(start_node=last_node, end_node=end_node)
    end_edge, _ = ConditionalEdgeV2.objects.get_or_create(start_node=base_supervisor, end_node=end_node,
                                                          condition=end_node.stage.stage_id)

    graph_edges.append(start_edge)
    graph_edges.append(final_edge)
    graph_force_edges.append(final_force_edge)
    graph_conditional_edges.append(end_edge)

    distinct_condition_edge_count = len(set(graph_conditional_edges))
    distinct_edge_count = len(set(graph_edges))
    distinct_force_edge_count = len(set(graph_force_edges))

    existing_graphs = GraphV2.objects.annotate(
        matched_conditional_edges=Count(
            "conditional_edges", filter=Q(conditional_edges__in=graph_conditional_edges), distinct=True
        ),
        matched_edges=Count(
            "edges", filter=Q(edges__in=graph_edges), distinct=True
        ),
        matched_force_edges=Count(
            "force_edges", filter=Q(force_edges__in=graph_force_edges), distinct=True
        ),
        total_conditional_edges=Count("conditional_edges", distinct=True),
        total_edges=Count("edges", distinct=True),
        total_force_edges=Count("force_edges", distinct=True),
    ).filter(
        start_node=start_sentinel,
        end_node=end_sentinel,
        # Ensure the counts match exactly
        matched_conditional_edges=distinct_condition_edge_count,
        total_conditional_edges=distinct_condition_edge_count,
        matched_edges=distinct_edge_count,
        total_edges=distinct_edge_count,
        matched_force_edges=distinct_force_edge_count,
        total_force_edges=distinct_force_edge_count,
    ).distinct()

    if existing_graphs.first() is None:
        graph = GraphV2.objects.create(
            start_node=start_sentinel,
            end_node=end_sentinel,
            # edges=graph_edges,
            # conditional_edges=graph_conditional_edges,
            # force_edge=graph_force_edges
        )
        graph.edges.set(graph_edges)
        graph.conditional_edges.set(graph_conditional_edges)
        graph.force_edges.set(graph_force_edges)
        graph.save()
    else:
        graph = existing_graphs.first()

    return graph


def format_date(date):
    """Format a datetime object to a readable string."""
    if date:
        return date.strftime('%Y-%m-%d %H:%M:%S')
    return None


def interview_to_dict(interview: InterviewV2) -> List[Dict]:
    """Convert an InterviewV2 object to a dictionary."""
    interview_data = [
        {"label": "Interview ID", "value": str(interview.id)},
        {"label": "Status", "value": interview.status.upper() if interview.status else "N/A"},
    ]

    # Add started datetime if it exists
    if interview.started_datetime:
        interview_data.append({
            "label": "Started Date & Time",
            "value": format_date(interview.started_datetime),
        })

    # Add ended datetime if it exists
    if interview.ended_datetime:
        interview_data.append({
            "label": "Ended Date & Time",
            "value": format_date(interview.ended_datetime),
        })

    # Add interviewer if it exists
    if interview.interviewer:
        interviewer_name = interview.interviewer.get_full_name() if hasattr(interview.interviewer,
                                                                            'get_full_name') else str(
            interview.interviewer)
        interview_data.append({
            "label": "Interviewer",
            "value": interviewer_name,
        })

    # Add job role from metadata if it exists
    job_role = interview.metadata.get('job', {}).get('role') if interview.metadata else "N/A"
    interview_data.append({
        "label": "Job Role",
        "value": job_role,
    })

    return interview_data


def candidate_to_dict(candidate):
    """Convert a Candidate object to a dictionary."""
    candidate_data = [
        {"label": "Name",
         "value": candidate.get_full_name() if hasattr(candidate, 'get_full_name') else str(candidate)},
        {"label": "Phone", "value": candidate.phone if candidate.phone else None},
        {"label": "Email", "value": candidate.email if candidate.email else None},
    ]

    # Add resume link if it exists
    if candidate.resume:
        candidate_data.append({
            "label": "Resume",
            "value": candidate.resume.url,
        })
    else:
        candidate_data.append({"label": "Resume", "value": None})

    return candidate_data


def clear_output(text: str) -> str:
    return text.replace("\\", "\\\\")


def process_recording_for_hls(input_path, output_path, chunk_type='mp4', segment_type='mp4'):
    # List all files in the input path
    dirs, files = default_storage.listdir(input_path)
    supported_types = {
        'mp4': 'mp4',
        'webm': 'ts'
    }

    chunk_type = None
    for file in files:
        extension = file.split('.')[-1]
        if extension in supported_types.keys():
            chunk_type = extension
            segment_type = supported_types.get(chunk_type)
            break
    files = list(filter(lambda x: x.endswith(f'.{chunk_type}'), files))
    files.sort()  # Sort the files to ensure they are concatenated in order

    if len(files) == 0:
        return None

    with tempfile.TemporaryDirectory() as write_dir:
        with tempfile.NamedTemporaryFile(prefix='combined', suffix=f'.{chunk_type}', mode='wb') as combined:
            # Write all chunks to a temporary directory and prepare file list for FFmpeg
            for file in files:
                if not file.endswith(f'.{chunk_type}'):
                    continue
                full_path = os.path.join(input_path, file)
                with default_storage.open(full_path, mode='rb') as f:
                    combined.write(f.read())
            combined.seek(0)

            # ffmpeg_command = [
            #     'ffmpeg',
            #     # '-v', 'debug',
            #     '-v', 'quiet',
            #     '-i', combined.name,
            #     '-c:v', 'libx264',  # Desired video codec
            #     '-c:a', 'aac',  # Desired audio codec
            #     '-hls_time', '10',  # Segment duration in seconds
            #     '-hls_playlist_type', 'vod',
            #     '-hls_list_size', '0',  # Keep all segments in the playlist
            #     '-hls_flags', 'independent_segments',  # For proper segmentation
            #     '-hls_segment_filename', f'{write_dir}/segment%08d.{segment_type}',  # Segment naming
            #     # '-f', 'hls',            # Output format: HLS
            #     f'{write_dir}/playlist.m3u8'  # Output playlist file
            # ]

            # FFmpeg command to convert and segment
            ffmpeg_command = [
                'ffmpeg',
                # '-v', 'debug',
                '-i', combined.name,
                '-hls_time', '10',  # Segment duration in seconds
                '-hls_list_size', '0',  # Keep all segments in the playlist
                '-hls_playlist_type', 'vod',
                '-hls_flags', 'independent_segments',  # For proper segmentation
                '-hls_segment_filename', f'{write_dir}/segment%08d.{segment_type}',  # Segment naming
                f'{write_dir}/playlist.m3u8'  # Output playlist file
            ]

            if chunk_type == 'mp4':
                # Skip re-encoding if using fragmented mp4
                ffmpeg_command.extend([
                    '-c', 'copy',
                ])
            else:
                ffmpeg_command.extend([
                    '-c:v', 'libx264',  # Desired video codec
                    '-c:a', 'aac',  # Desired audio codec
                ])

            try:
                # Execute FFmpeg command
                subprocess.run(ffmpeg_command, check=True)
            except subprocess.CalledProcessError as e:
                raise Exception(f"FFmpeg failed: {e}")
            except Exception as e:
                raise Exception(f"Error during processing: {e}")

        # Save all HLS files (playlist and segments) back to default storage
        failures = []
        with futures.ThreadPoolExecutor() as executor:
            future = []

            def write_to_storage(write_path, read_path):
                with open(read_path, 'rb') as reader:
                    write_content = ContentFile(reader.read())  # Read temp file content
                    default_storage.save(write_path, write_content)

            for content in os.listdir(write_dir):
                write_path = os.path.join(output_path, content)  # Path in storage
                read_path = os.path.join(write_dir, content)  # Local temp file
                future.append(
                    executor.submit(write_to_storage, write_path, read_path)
                )

            for f in futures.as_completed(future):
                try:
                    f.result()
                except Exception as e:
                    failures.append(str(e))
            if len(failures):
                raise Exception(f'Failed to write: {"; ".join(failures)}')

        playlist_url = default_storage.url(os.path.join(output_path, 'playlist.m3u8'))
        if settings.SETTINGS_MODULE.find('local') >= 0:
            return f'http://localhost:8000{playlist_url}'
        return playlist_url


def delete_storage_directory(directory_path):
    directories, files = default_storage.listdir(directory_path)

    for item in directories:
        item_path = os.path.join(directory_path, item)
        if default_storage.exists(item_path):
            delete_storage_directory(item_path)

    for item in files:
        item_path = os.path.join(directory_path, item)
        if default_storage.exists(item_path):
            default_storage.delete(item_path)

    if default_storage.exists(directory_path):
        default_storage.delete(directory_path)


def adelete_storage_directory(path):
    thread = threading.Thread(target=delete_storage_directory, args=(path,), daemon=True)
    thread.start()


def get_chunk_path(id, type, uid=None):
    chunk_path = settings.INTERVIEW_RECORDING.get(type.upper(), {}).get('CHUNK_PATH')
    if not chunk_path:
        chunk_path = f'interviews/{id}/{type}s/chunks/'
        if type.upper() == 'AUDIO':
            chunk_path += f'{uid}'
    else:
        chunk_path = chunk_path.format(interview=str(id), uid=uid)
    return chunk_path


def get_audio_from_storage_chunks(id, uid, encoding):
    chunk_path = settings.INTERVIEW_RECORDING.get('AUDIO', {}).get('CHUNK_PATH')
    if not chunk_path:
        chunk_path = f'interviews/{id}/audios/chunks/{uid}/'
    else:
        chunk_path = chunk_path.format(interview=str(id), uid=str(uid))

    chunks = []
    dirs, files = default_storage.listdir(chunk_path)
    files = list(filter(lambda x: x.endswith(f'.{encoding}'), files))
    files.sort()

    for file in files:
        full_path = os.path.join(chunk_path, file)
        with default_storage.open(full_path, mode='rb') as f:
            chunks.append(f.read())
    return ContentFile(b''.join(chunks), name=files[0])