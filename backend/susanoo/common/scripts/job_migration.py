from uuid import uuid4
from susanoo.interview.models import InterviewV2
from susanoo.job.models import Job

from django.db import transaction

def migrate_jobs():
    # Dictionary to store already created jobs per graph
    graph_to_job = {}

    # Start transaction so it's all atomic
    with transaction.atomic():
        for interview in InterviewV2.objects.all():
            graph = interview.graph

            if not graph:
                continue  # skip interviews without a graph

            # If we haven’t created a job for this graph yet, create it
            if graph.id not in graph_to_job:
                job_id = f"{str(graph.type).upper()}-{uuid4().hex[:6].upper()}"
                job = Job.objects.create(
                    organization=interview.organization,
                    job_id=job_id,
                    title=f"Auto Job for {job_id}",
                    role="Auto-generated",
                    graph=graph
                )

                # Optionally set stages from this interview
                job.stages.set(interview.stages.all())
                job.save()

                graph_to_job[graph.id] = job
            else:
                job = graph_to_job[graph.id]

            # Link the interview to this job
            interview.job = job
            interview.save(update_fields=["job"])

    print("✅ Job migration complete.")