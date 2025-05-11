import abc

from rasengan.feedback.manager import SWEFeedbackManager, PitchFeedbackManager
from susanoo.interview.enums import InterviewType
from susanoo.interview.models import InterviewV2


class FeedbackEngine(abc.ABC):
    def __init__(self, **kwargs):
        self.manager = None

    def _setup(self, interview: InterviewV2):
        # TODO: Inject this in the engine from the function using it by building the manager using factory
        if interview.type == InterviewType.PITCH:
            self.manager = PitchFeedbackManager()
        else:
            self.manager = SWEFeedbackManager()

    def generate(self, provider: str, model: str, interview: InterviewV2):
        self._setup(interview)
        return self.manager.generate(provider, model, interview)

    def retrieve(self, interview: InterviewV2):
        self._setup(interview)
        return self.manager.retrieve(interview)
