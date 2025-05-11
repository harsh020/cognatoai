import wave
import struct
import subprocess

def convert_webm_to_wav(input_file, output_file):
  """
  Converts a WebM audio file to WAV with a sample rate of 16000 Hz using ffmpeg.

  Args:
      input_file (str): Path to the input WebM audio file.
      output_file (str): Path to the output WAV audio file.
  """

  # Use ffmpeg to convert with specific options
  command = ['ffmpeg',
             '-i', input_file,  # Input file
             '-ar', '16000',    # Set sample rate to 16000 Hz
             '-ac', '1',        # Convert to mono (optional)
             '-vn',             # Disable video stream (if present)
             '-acodec', 'pcm_s16le',  # Output audio format (WAV)
             output_file]       # Output file

  # Execute the ffmpeg command
  subprocess.run(command, check=True)


def read_wav_header(input_file):
    # Open the WAV file for reading
    with wave.open(input_file, 'rb') as wf:
        # Read the WAV file header
        num_channels = wf.getnchannels()
        sample_width = wf.getsampwidth()
        sample_rate = wf.getframerate()
        num_frames = wf.getnframes()
        compression_type = wf.getcomptype()
        compression_name = wf.getcompname()

        # Return the WAV header information
        return (num_channels, sample_width, sample_rate, num_frames, compression_type, compression_name)


def add_wav_header(header_file, input_file, output_file):
    # Pack the WAV header into binary data
    header = read_wav_header(header_file)
    header_data = struct.pack('<HHIIHH', *header)

    # Open the input file for reading
    with open(input_file, 'rb') as infile:
        # Open the output file for writing
        with open(output_file, 'wb') as outfile:
            # Write the header data to the output file
            outfile.write(header_data)

            # Write the audio data from the input file to the output file
            data = infile.read()
            outfile.write(data)


def duplicate(obj, value=None, field=None, duplicate_order=None):
    """
    Duplicate all related objects of obj setting
    field to value. If one of the duplicate
    objects has an FK to another duplicate object
    update that as well. Return the duplicate copy
    of obj.
    duplicate_order is a list of models which specify how
    the duplicate objects are saved. For complex objects
    this can matter. Check to save if objects are being
    saved correctly and if not just pass in related objects
    in the order that they should be saved.
    """
    from django.db.models.deletion import Collector
    from django.db.models.fields.related import ForeignKey

    collector = Collector(using='default')
    collector.collect([obj])
    collector.sort()
    related_models = collector.data.keys()
    data_snapshot = {}
    for key in collector.data.keys():
        data_snapshot.update(
            {key: dict(zip([item.pk for item in collector.data[key]], [item for item in collector.data[key]]))})
    root_obj = None

    # Sometimes it's good enough just to save in reverse deletion order.
    if duplicate_order is None:
        duplicate_order = reversed(related_models)

    for model in duplicate_order:
        # Find all FKs on model that point to a related_model.
        fks = []
        for f in model._meta.fields:
            if isinstance(f, ForeignKey) and f.remote_field.related_model in related_models:
                fks.append(f)
        # Replace each `sub_obj` with a duplicate.
        if model not in collector.data:
            continue
        sub_objects = collector.data[model]
        for obj in sub_objects:
            for fk in fks:
                fk_value = getattr(obj, "%s_id" % fk.name)
                # If this FK has been duplicated then point to the duplicate.
                fk_rel_to = data_snapshot[fk.remote_field.related_model]
                if fk_value in fk_rel_to:
                    dupe_obj = fk_rel_to[fk_value]
                    setattr(obj, fk.name, dupe_obj)
            # Duplicate the object and save it.
            obj.id = None
            if field is not None:
                setattr(obj, field, value)
            obj.save()
            if root_obj is None:
                root_obj = obj
    return root_obj