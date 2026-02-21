'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface Student {
  id: number
  name: string
  class: {
    id: number
    name: string
  }
}

interface Class {
  id: number
  name: string
}

interface AttendanceData {
  status: string
  note: string
  isQuietTimeDone: boolean
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(getNextSunday())
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({})
  const [noteMap, setNoteMap] = useState<Record<number, string>>({})
  const [quietTimeMap, setQuietTimeMap] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dateError, setDateError] = useState<string>('')

  useEffect(() => {
    fetchClasses()
  }, [])

  // 다음 일요일 구하는 함수
  function getNextSunday(): string {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilSunday = (7 - dayOfWeek) % 7
    const nextSunday = new Date(today)
    nextSunday.setDate(today.getDate() + daysUntilSunday)
    return nextSunday.toISOString().split('T')[0]
  }

  // 일요일인지 확인하는 함수
  function isSunday(dateString: string): boolean {
    const date = new Date(dateString)
    return date.getDay() === 0
  }

  // 가장 가까운 일요일 찾기
  function getNearestSunday(dateString: string): string {
    const date = new Date(dateString)
    const dayOfWeek = date.getDay()
    const daysUntilSunday = (7 - dayOfWeek) % 7
    const nearestSunday = new Date(date)
    nearestSunday.setDate(date.getDate() + daysUntilSunday)
    return nearestSunday.toISOString().split('T')[0]
  }

  // 날짜 변경 핸들러
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    if (isSunday(newDate)) {
      setSelectedDate(newDate)
      setDateError('')
    } else {
      const nearestSunday = getNearestSunday(newDate)
      setDateError(`${newDate}는(은) 일요일이 아닙니다. ${nearestSunday} (일요일)로 선택하시겠습니까?`)
      // 사용자가 명시적으로 선택할 수 있도록 일요일로 자동 변경하지 않음
    }
  }

  // 가장 가까운 일요일로 선택
  const selectNearestSunday = () => {
    const nearestSunday = getNearestSunday(selectedDate)
    setSelectedDate(nearestSunday)
    setDateError('')
  }

  // 이전 일요일로 이동
  const goToPreviousSunday = () => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(currentDate.getDate() - 7)
    setSelectedDate(currentDate.toISOString().split('T')[0])
    setDateError('')
  }

  // 다음 일요일로 이동
  const goToNextSunday = () => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(currentDate.getDate() + 7)
    setSelectedDate(currentDate.toISOString().split('T')[0])
    setDateError('')
  }

  // 최근 일요일들 계산 (최근 8주)
  const getRecentSundays = (): string[] => {
    const sundays: string[] = []
    const today = new Date()
    const dayOfWeek = today.getDay()

    // 이번 주 일요일 찾기
    const thisSunday = new Date(today)
    thisSunday.setDate(today.getDate() + ((7 - dayOfWeek) % 7))

    // 최근 8주의 일요일들 계산
    for (let i = 0; i < 8; i++) {
      const sunday = new Date(thisSunday)
      sunday.setDate(thisSunday.getDate() - (i * 7))
      sundays.push(sunday.toISOString().split('T')[0])
    }

    return sundays
  }

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
      fetchAttendance()
    }
  }, [selectedClass, selectedDate])

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      if (!res.ok) {
        throw new Error('반 목록을 불러오는데 실패했습니다')
      }
      const data = await res.json()
      const classArray = Array.isArray(data) ? data : []
      setClasses(classArray)
      if (classArray.length > 0) setSelectedClass(classArray[0].id.toString())
    } catch (error) {
      console.error('반 목록을 불러오는데 실패했습니다:', error)
      setClasses([])
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/students?classId=${selectedClass}`)
      if (!res.ok) {
        throw new Error('학생 목록을 불러오는데 실패했습니다')
      }
      const data = await res.json()
      setStudents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('학생 목록을 불러오는데 실패했습니다:', error)
      setStudents([])
    }
  }

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`/api/attendance?date=${selectedDate}&classId=${selectedClass}`)
      if (!res.ok) {
        throw new Error('출석 기록을 불러오는데 실패했습니다')
      }
      const data = await res.json()
      const statusMap: Record<number, string> = {}
      const noteMap: Record<number, string> = {}
      const quietTimeMap: Record<number, boolean> = {}
      const attendanceArray = Array.isArray(data) ? data : []
      attendanceArray.forEach((a: any) => {
        statusMap[a.studentId] = a.status
        noteMap[a.studentId] = a.note || ''
        quietTimeMap[a.studentId] = a.isQuietTimeDone || false
      })
      setAttendanceMap(statusMap)
      setNoteMap(noteMap)
      setQuietTimeMap(quietTimeMap)
    } catch (error) {
      console.error('출석 기록을 불러오는데 실패했습니다:', error)
    }
  }

  const handleAttendanceChange = (studentId: number, status: string) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }))
    setSaved(false)
  }

  const handleNoteChange = (studentId: number, note: string) => {
    setNoteMap(prev => ({ ...prev, [studentId]: note }))
    setSaved(false)
  }

  const handleQuietTimeChange = (studentId: number, checked: boolean) => {
    setQuietTimeMap(prev => ({ ...prev, [studentId]: checked }))
    setSaved(false)
  }

  const handleSaveAll = async () => {
    setLoading(true)
    try {
      const promises = students.map(student =>
        fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.id,
            date: selectedDate,
            status: attendanceMap[student.id] || 'ABSENT',
            note: noteMap[student.id] || '',
            isQuietTimeDone: quietTimeMap[student.id] || false
          })
        })
      )

      await Promise.all(promises)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('출석 저장에 실패했습니다:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedClassData = classes.find(c => c.id === parseInt(selectedClass))

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-2 block">← 홈</Link>
            <h1 className="text-3xl font-bold text-gray-900">출석 체크</h1>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>날짜와 반 선택</CardTitle>
            <CardDescription>출석을 체크할 날짜와 반을 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="date">날짜 (일요일)</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={goToPreviousSunday}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    ←
                  </Button>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="flex-1"
                  />
                  <Button
                    onClick={goToNextSunday}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    →
                  </Button>
                </div>
                <div className="mt-2">
                  <Label htmlFor="recent-sundays" className="text-xs text-gray-600">
                    빠른 선택
                  </Label>
                  <select
                    id="recent-sundays"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setDateError('')
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="" disabled>최근 일요일 선택</option>
                    {getRecentSundays().map(date => (
                      <option key={date} value={date}>
                        {date} {date === getNextSunday() ? '(다음 일요일)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">* 일요일만 선택 가능</p>
                {dateError && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">{dateError}</p>
                    <Button
                      onClick={selectNearestSunday}
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs"
                    >
                      가장 가까운 일요일로 선택
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="class">반</Label>
                <select
                  id="class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {students.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">학생이 없습니다</p>
              <Link href="/students" className="mt-4">
                <Button>학생 추가하러 가기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedClassData?.name} 출석 체크</CardTitle>
                    <CardDescription className="text-sm">
                      {selectedDate} • 총 {students.length}명
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleSaveAll}
                    disabled={loading}
                    size="sm"
                    className={saved ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {loading ? "저장 중..." : saved ? "저장 완료!" : "일괄 저장"}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <div className="space-y-3">
              {students.map((student) => (
                <Card key={student.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.class.name}</p>
                    </div>
                    <div className="grid grid-cols-2 divide-x">
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'PRESENT')}
                        className={`p-4 text-center transition-colors ${
                          attendanceMap[student.id] === 'PRESENT'
                            ? 'bg-green-50 border-b-4 border-green-500'
                            : 'bg-white hover:bg-green-50'
                        }`}
                      >
                        <div className="text-3xl mb-1">✓</div>
                        <div className={`text-sm font-medium ${
                          attendanceMap[student.id] === 'PRESENT' ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          출석
                        </div>
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'ABSENT')}
                        className={`p-4 text-center transition-colors ${
                          attendanceMap[student.id] === 'ABSENT'
                            ? 'bg-red-50 border-b-4 border-red-500'
                            : 'bg-white hover:bg-red-50'
                        }`}
                      >
                        <div className="text-3xl mb-1">✗</div>
                        <div className={`text-sm font-medium ${
                          attendanceMap[student.id] === 'ABSENT' ? 'text-red-700' : 'text-gray-600'
                        }`}>
                          결석
                        </div>
                      </button>
                    </div>
                    <div className="p-4 space-y-3 border-t">
                      <div>
                        <Label htmlFor={`note-${student.id}`} className="text-sm text-gray-700">
                          Note (기도제목/결석사유)
                        </Label>
                        <Textarea
                          id={`note-${student.id}`}
                          placeholder="기도제목 또는 결석 사유를 입력하세요"
                          value={noteMap[student.id] || ''}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          className="mt-1 min-h-16 resize-none"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`quiet-${student.id}`}
                          checked={quietTimeMap[student.id] || false}
                          onCheckedChange={(checked) => handleQuietTimeChange(student.id, checked === true)}
                        />
                        <Label
                          htmlFor={`quiet-${student.id}`}
                          className="text-sm cursor-pointer"
                        >
                          큐티 완료
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleSaveAll}
              disabled={loading}
              className="w-full mt-6 py-6 text-lg"
              size="lg"
            >
              {loading ? "저장 중..." : saved ? "✓ 저장 완료!" : "일괄 저장"}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
