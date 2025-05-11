"use client"

import React, {useEffect, useMemo} from 'react';
import {cn, getLevelBadgeClasses, getStageNameMapping, getStatusBadgeClasses, toTitleCase} from "@/lib/utils";
import {Inbox, AudioLines} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsList, TabsContent, TabsTrigger} from "@/components/ui/tabs";
import HLSPlayer from "@/components/hls-player";
import {DATA} from "@/lib/data";
import {
  PolarAngleAxis,
  PolarGrid,
  RadarChart,
  Radar,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  XAxis, YAxis, Bar
} from "recharts";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Button} from "@/components/ui/button";
import ScoreRadialProgress from "@/components/score-radial-progress";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {AUDIO_STATUS, RECORDING_STATUS} from "@/lib/constants";
import {useAudioPlayer} from "@/lib/hooks";
import Code from "@/components/code";
import {useParams} from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import NoData from "@/components/no-data";
import {toast} from "sonner";
import {retrieveFeedback} from "@/store/feedback/actions";
import {retrieveRecording} from "@/store/recording/actions";
import {retrieveActivity} from "@/store/activity/actions";
import Loader from "@/components/loader";
import {ACTIVITY_RETRIEVE_RESET} from "@/store/activity/constants";
import {RECORDING_RETRIEVE_RESET} from "@/store/recording/constants";
import {FEEDBACK_RETRIEVE_RESET} from "@/store/feedback/constants";
import {INTERVIEW_RETRIEVE_SUCCESS} from "@/store/interview/constants";

const scoreChartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-6))",
  },
}
const tabActivityChartConfig = {
  tab_switch: {
    label: "Tab Switches",
    color: "hsl(var(--chart-6))",
  },
}

const LevelBadge = ({ className, level }) => {

  return (
    <span className={cn(
      'px-2 py-1 text-xs rounded-full',
      getLevelBadgeClasses(level),
      className,
    )}>
      {toTitleCase(level)}
    </span>
  );
};

function AudioPlayer({ src, className, playbackRate = 1.0 }) {
  const { audioStatus, play, pause, stop } = useAudioPlayer(src, playbackRate);

  return (
    <span
      className={cn('flex bg-muted/80 p-2 hover:cursor-pointer hover:bg-muted rounded-full w-fit h-fit', className, audioStatus === AUDIO_STATUS.INACTIVE ? 'text-foreground/80' : (audioStatus === AUDIO_STATUS.PAUSED ? 'text-orange-500' : 'text-green-500'))}
      onClick={() => {
        if (audioStatus === AUDIO_STATUS.INACTIVE || audioStatus === AUDIO_STATUS.PAUSED) play(src);
        else pause();
      }}
    >
      <AudioLines className='h-4 w-4' />
    </span>
  )
}

function CodeSheet({ stage, transcripts }) {
  return (
    <div className='flex flex-col w-full h-full text-sm gap-8 text-foreground'>
      {
        transcripts.map((transcript, index) => (
          <div key={`${stage}-${index}`} className='flex flex-col w-full h-full gap-1'>
            <span className='flex flex-row font-semibold'>{transcript.question}</span>
            {
              transcript.audio && (
                <AudioPlayer className='float-left mr-1' src={transcript.audio} />
              )
            }
            <span className='block'>{transcript.approach}</span>
            <span className='block'>
              <Code>
                {transcript.code}
              </Code>
            </span>
          </div>
        ))
      }
    </div>
  )
}

function TranscriptSheet({ stage, transcripts }) {
  return (
    <div className='flex flex-col w-full h-full text-sm gap-8 text-foreground'>
      {
        transcripts.map((transcript, index) => (
          <div key={`${stage}-${index}`} className='flex flex-col w-full h-full gap-1'>
            <span className='flex flex-row font-semibold'>{transcript.question}</span>
            {
              transcript.audio && (
                <AudioPlayer className='float-left mr-1' src={transcript.audio} />
              )
            }
            <span className='block'>{transcript.answer}</span>
          </div>
        ))
      }
    </div>
  )
}

function FeedbackCard({ stage, feedback, transcripts }) {
  return (
    <Card className='h-full w-full'>
      <CardHeader className='w-full h-full'>
        <div className='flex flex-row justify-between w-full'>
          <div className='flex flex-col justify-between'>
            {/*<CardTitle>*/}
            {/*  {toTitleCase(stage)}*/}
            {/*</CardTitle>*/}

            <Sheet>
              <SheetTrigger>
                <Button variant='outline' className='text-xs items-start justify-start'>
                  View Transcript
                </Button>
              </SheetTrigger>
              <SheetContent className="min-w-[60vw] md:min-w-[40vw] h-full overflow-y-auto scrollbar-thin">
                <SheetHeader className='gap-6'>
                  <SheetTitle>{toTitleCase(stage)}</SheetTitle>
                  {/*<SheetDescription>*/}
                    {
                      stage === 'coding' ? (
                        <CodeSheet stage={stage} transcripts={transcripts} />
                      ) : (
                        <TranscriptSheet stage={stage} transcripts={transcripts} />
                      )
                    }
                  {/*</SheetDescription>*/}
                </SheetHeader>
              </SheetContent>
            </Sheet>


            <span className='text-sm text-foreground/50'>Predicted: <LevelBadge className='px-4' level={feedback.level} /></span>
          </div>

          {/*<div className='flex flex-col m-auto'>*/}
          {/*  <Button variant='outline' className='text-xs'>*/}
          {/*    View Transcript*/}
          {/*  </Button>*/}
          {/*</div>*/}

          <div className='flex flex-col'>
            <ScoreRadialProgress value={feedback.score} />
          </div>

        </div>
      </CardHeader>

      <CardContent className='text-sm'>
        {feedback.detail}
      </CardContent>
    </Card>
  )
}

function FeedbackTabs({ feedback }) {

  let startStage = null;
  let endStage = null;

  const validStages = [];
  const stages = Object.keys(feedback);
  stages.forEach(s => {
    if(feedback[s].feedback) {
      if(s === 'resume_discussion') startStage = s;
      else if(s === 'coding') endStage = s;
      else validStages.push(s);
    }
  });
  if(!startStage) startStage = validStages.shift();
  else if(!endStage && validStages.length > 1) endStage = validStages.pop();

  return (
    <Tabs defaultValue={startStage} className="w-full">
      <TabsList className="flex gap-2 overflow-x-auto justify-start w-full scrollbar-hide">
        {startStage &&
          (<TabsTrigger value={startStage}>{toTitleCase(startStage)}</TabsTrigger>)
        }
        {validStages.map(stage => <TabsTrigger key={stage} value={stage}>{toTitleCase(stage)}</TabsTrigger>)}
        {endStage && (
          <TabsTrigger value={endStage}>{toTitleCase(endStage)}</TabsTrigger>
        )}
      </TabsList>
      {
        startStage && (
          <TabsContent value={startStage}>
            <FeedbackCard stage={startStage} feedback={feedback[startStage].feedback} transcripts={feedback[startStage].discussion} />
          </TabsContent>
        )
      }

      {
        validStages.map(stage => (
          <TabsContent key={stage} value={stage}>
            <FeedbackCard stage={stage} feedback={feedback[stage].feedback} transcripts={feedback[stage].discussion} />
          </TabsContent>
        ))
      }

      {
        endStage && (
          <TabsContent value={endStage}>
            <FeedbackCard stage={endStage} feedback={feedback[endStage].feedback} transcripts={feedback[endStage].discussion} />
          </TabsContent>
        )
      }
    </Tabs>
  )
}

function TabActivityChart({ id }) {
  const dispatch = useDispatch();
  const { error, loading, activity } = useSelector(state => state.retrieveActivity);

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(!activity) {
      dispatch(retrieveActivity(id));
    }
  }, [activity, error]);

  return (
    <Card className='gap-2 h-full w-full'>
      <CardHeader>
        <CardTitle>Tab Activity</CardTitle>
        <CardDescription>Showing count of tab switched per module</CardDescription>
      </CardHeader>
      <CardContent className='h-full w-full'>
        {
          loading ? (
            <Loader />
          ) : activity ? (
            <ChartContainer className='h-full w-full' config={tabActivityChartConfig}>
              <BarChart
                accessibilityLayer
                data={activity.data}
                layout="vertical"
                // margin={{
                //   left: -20,
                // }}
              >
                <YAxis
                  dataKey="stage"
                  type="category"
                  angle={0}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => getStageNameMapping(value)}
                />
                <XAxis type="number" dataKey="tab_switch" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="tab_switch" fill="var(--chart-7)" radius={5} />
              </BarChart>
            </ChartContainer>
          ) : (
            <NoData text='Something went wrong when fetching candidate activity. Please try after sometime.' />
          )
        }
      </CardContent>
    </Card>
  )
}

function ScoreChart({ feedback }) {
  // const feedback = DATA.feedback;
  const scores = [];
  Object.keys(feedback).forEach(stage => {
    if(stage !== 'introduction' && stage !== 'question_interviewer')
      scores.push({
        stage: toTitleCase(stage),
        score: feedback[stage].feedback?.score
      });
  });

  return (
    <Card className='gap-2  h-full w-full'>
      <CardHeader className="items-center pb-4">
        <CardTitle>Module Scores</CardTitle>
        <CardDescription>
          Showing scores across different modules
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0 h-full w-full">
        <ChartContainer
          config={scoreChartConfig}
          className="mx-auto aspect-square"
        >
          <RadarChart data={scores}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid
              className="fill-[var(--chart-7)] opacity-20"
              gridType="circle"
            />
            <PolarAngleAxis
              dataKey="stage"
              tick={({ x, y, textAnchor, value, index, ...props }) => {
                const data = scores[index]
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    fontSize={13}
                    fontWeight={500}
                    // transform={`rotate(-45, ${x}, ${index === 0 ? y - 10 : y})`}
                    {...props}
                  >
                    <tspan
                      x={x}
                      dy={'0rem'}
                      fontSize={10}
                      className="fill-muted-foreground"
                    >
                      {getStageNameMapping(data.stage)}
                    </tspan>
                  </text>
                )
              }}
            />
            <Radar
              dataKey="score"
              fill="var(--chart-7)"
              fillOpacity={0.5}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function InterviewRecording({ id }) {
  const dispatch = useDispatch();
  const { error, loading, recording } = useSelector(state => state.retrieveRecording)

  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(!recording) {
      dispatch(retrieveRecording(id));
    }
  }, [id, recording, error]);

  return (
    <Card className='gap-0 p-0 w-full h-full aspect-video'>
      <CardContent className='h-full w-full m-auto p-0'>
        {
          loading ? (
            <Loader />
          ) : recording ? (
            recording.status?.toUpperCase() === RECORDING_STATUS.PROCESSED ? (
              <HLSPlayer className='h-full w-full rounded-xl object-cover' src={recording.url} />
            ) : recording.status?.toUpperCase() === RECORDING_STATUS.FAILED ? (
              <NoData text='Recording could not be prcessed. Please contact us for more details.' />
            ) : (
              <NoData text='We are still processing the recording. Please check back later.' />
            )
          ) : (
            <NoData text='Something went wrong while fetching the result. Please try again later.' />
          )
        }
      </CardContent>
    </Card>
  )
}

export default function InterviewDetails({ }) {
  const { id } = useParams();
  const dispatch = useDispatch();

  // const { interview } = useSelector(state => state.retrieveInterview);
  const { loading: interviewsLoading, interviews } = useSelector(state => state.listInterviews)
  const { error, loading, feedback } = useSelector(state => state.retrieveFeedback)

  const interview = useMemo(() => {
    if(interviews) return interviews.results.find(i => i.id === id);
  }, [id]);

  useEffect(() => {
    dispatch({
      type: FEEDBACK_RETRIEVE_RESET
    });
    // dispatch({
    //   type: INTERVIEW_RETRIEVE_SUCCESS,
    //   payload: interviews.results.find(i => i.id === id),
    // });
  }, [id]);


  useEffect(() => {
    if(error) {
      toast.error(error.message);
    } else if(interview?.status === 'completed' && interview?.feedback_status === 'completed' && !feedback && !loading) {
      dispatch({
        type: ACTIVITY_RETRIEVE_RESET
      });
      dispatch({
        type: RECORDING_RETRIEVE_RESET
      });
      dispatch(retrieveFeedback(id));
    }
  }, [error, loading, interview, dispatch]);


  return (
      <div className="flex flex-col h-full w-full">
        {interview?.status === 'completed' && interview?.feedback_status === 'completed' ? (
            loading ? (
                <Loader />
            ) : feedback ? (
                <div className="flex flex-col h-full w-full gap-4">
                  {/* Recording always full‑width */}
                  <div className="w-full">
                    <InterviewRecording id={id} />
                  </div>

                  {/* Charts: stack vertically on mobile, two columns at md+ */}
                  <div className="flex flex-col md:flex-row w-full gap-4">
                    <div className="w-full md:w-1/2">
                      <ScoreChart feedback={feedback} />
                    </div>
                    <div className="w-full md:w-1/2">
                      <TabActivityChart id={id} />
                    </div>
                  </div>

                  {/* Feedback tabs full‑width */}
                  <div className="w-full">
                    <FeedbackTabs feedback={feedback} />
                  </div>
                </div>
            ) : (
                <NoData text="Something went wrong while fetching the result. Please try again later." />
            )
        ) : interviewsLoading ? (
            <Loader />
        ) : interview?.status !== 'completed' ? (
            <NoData text="Feedback is available only after the interview has completed." />
        ) : (
            <NoData text="We are still evaluating the result. Please check back later." />
        )}
      </div>
  );
}