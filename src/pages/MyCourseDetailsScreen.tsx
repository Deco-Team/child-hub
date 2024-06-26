import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import useCourse from '../hooks/api/useCourseApi'
import { ICourse, ILesson } from '../business/course/course'
import { ResizeMode, Video } from 'expo-av'
import LessonCard from '../components/LessonCard'
import { Pressable } from 'native-base'
import { usePreventScreenCapture } from 'expo-screen-capture'
import * as ScreenOrientation from 'expo-screen-orientation'

const MyCourseDetailsScreen = ({ route }: any) => {
  usePreventScreenCapture()

  const { id } = route.params
  const { getMyCourseDetail, completeLesson } = useCourse()

  const video = React.useRef(null)
  const [data, setData] = useState<ICourse>({} as ICourse)
  const [activeLesson, setActiveLesson] = useState<ILesson>({ video: '' } as ILesson)
  const [isPlaying, setIsPlaying] = useState(false)
  const [, setIsFullScreen] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  function togglePlaying() {
    if (isPlaying) {
      ;(video.current as any)?.pauseAsync()
    } else {
      ;(video.current as any)?.playAsync()
      ;(video.current as any)?.presentFullscreenPlayer()
    }
  }
  const durationInHour =
    Math.floor(data.duration / 60) + 'h' + (data.duration % 60 > 0 ? (data.duration % 60) + 'm' : '')

  const getAllData = async () => {
    try {
      const response = await getMyCourseDetail(id)
      if (response) {
        setData(response)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleVideoEnd = async () => {
    try {
      if (activeLesson.video !== '') {
        if (data.lessons && data.lessons.indexOf(activeLesson) >= 0) {
          await completeLesson(id, data.lessons.indexOf(activeLesson))
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getAllData()
    return () => {}
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
      <Video
        ref={video}
        source={{
          uri: activeLesson.video
        }}
        shouldPlay={false}
        useNativeControls
        usePoster={activeLesson.video === ''}
        posterSource={{
          uri: data.thumbnail
        }}
        resizeMode={ResizeMode.CONTAIN}
        style={{ alignSelf: 'center', width: '100%', aspectRatio: 16 / 9, backgroundColor: 'black' }}
        onError={() => {
          activeLesson.video !== '' && alert('Cannot play this video')
        }}
        onFullscreenUpdate={async ({ fullscreenUpdate }) => {
          if (fullscreenUpdate <= 1) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
          } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
            ;(video.current as any)?.pauseAsync()
          }
          setIsFullScreen(fullscreenUpdate)
        }}
        onPlaybackStatusUpdate={(status: any) => {
          if (status.didJustFinish) {
            handleVideoEnd()
          }
          setIsPlaying(status.isPlaying)
        }}
        // progressUpdateIntervalMillis={videoLength - 5000}
      />
      <ScrollView style={styles.scrollView} bounces={false}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>{data.title}</Text>
          <Text style={{ fontSize: 14 }}>
            {durationInHour} • {data.lessons?.length} lessons • {data.level}
          </Text>
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>About this course</Text>
          <Text style={{ fontSize: 14 }}>{data.description}</Text>
        </View>
        <View style={{ marginBottom: 60 }}>
          {data.lessons?.map((lesson, index) => (
            <Pressable key={index} _pressed={{ opacity: 0.6 }} paddingY={2} onPress={() => setActiveLesson(lesson)}>
              <LessonCard
                data={lesson}
                index={index}
                isPLaying={lesson === activeLesson}
                buttonIsPlaying={isPlaying}
                tooglePlaying={togglePlaying}
                setActiveLesson={setActiveLesson}
                fromMyCourse={true}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#fff'
  }
})

export default MyCourseDetailsScreen
