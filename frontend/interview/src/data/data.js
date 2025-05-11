

const candidateDetails = {
  'name': 'Candidate',
  'email': 'candidate@test.io',
  'phone': '+91-9876543210'
}

const jobDetails = {
  'id': '#1234',
  'company': 'Anthropic',
  'email': 'hr@anthropic.com',
  'role': 'Software Engineer'
}

const participants = [
  {
    'name': 'Ken Adams',
    'role': 'Interviewer',
    'profile_picture': '/media/images/illustrations/agent-1-sm.webp',
  },
  {
    'name': 'Candidate',
    'role': 'Candidate',
    'profile_picture': '/media/images/illustrations/user.webp',
  },
]

const interviewData = {
  'id': '1234',
  'interviewer': {
    'name': 'Ken Adams',
    'key': 'interviewer',
    'profile_picture': '/media/images/illustrations/agent-1-sm.webp'
  },
  'candidate': {
    'name': 'Candidate',
    'key': 'candidate',
    'profile_picture': '/media/images/illustrations/user.webp',
  },
  'timeout': 342,
  'stage': '1',
  'conversation': [
    {
      'type': 'interviewer',
      'content': "Hello, my name is Ken Adams, and I'm a Human Resource Representative here at Anthropic. Thank you for taking the time to interview with us today. Before we dive into the interview questions, I'd like to ask you how you're doing.",
      'timestamp': '2024-02-21T12:12:12.000'
    },
    {
      'type': 'candidate',
      'content': "Hi Ken. I am fine, thank you for asking.",
      'timestamp': '2024-02-21T12:12:13.000'
    },
  ],
  'code': {
    'enable_ide': false,
    'content': '',
    'timestamp': '',
    'language': 'python3'
  },
  'end': false
}

const guildelines = [
  'Ensure you have a good internet connection.',
  'Before joining the interview make sure to grant permissions for camera, microphone and screen share.',
  'Share your screen if and when tempted and do not stop screen share, video or audio at any point.',
  'Your activity is being monitored so please prevent any malpractices.',
  'Please listen to the interviewer very carefully and answer calmly and accordingly.',
  'When ready use the Start button and answer the question and press the Stop button after.',
  'If the answer requires coding use the coding tab and only code until explicitly asked to.',
  'If the question could be better answered in text, then use the text box.',
  // 'For the beta you can switch off the camera, but do not switch off the mic.',
  // 'For the beta the meeting is not being recorded but please be respectful.',
  // 'Ensure you are clearly audible and visible before joining in.',
  // 'For beta the live transcriptions are turned off. So, please use the Start/Stop button to speak and stop.',
  // 'You will be graded on your responses, so make sure to answer with best of your knowledge.',
  'Once in meeting, do not refresh the page or leave the interview.',
  'If something goes wrong please leave the interview and contact Cognato AI Team.',
]


export const DATA = {
  candidateDetails,
  jobDetails,
  participants,
  interviewData,
  guildelines,
}


