'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface AttendanceLog {
  date: string
  studentName: string
  className: string
  status: string
  note: string
  isQuietTimeDone: boolean
}

interface ClassStats {
  class: {
    id: number
    name: string
    teacherName: string
  }
  totalStudents: number
  totalAttendances: number
  presentCount: number
  absentCount: number
  attendanceRate: number
}

interface WeeklyStats {
  week: string
  attendanceRate: number
  presentCount: number
  totalStudents: number
}

const COLORS = ['#22c55e', '#ef4444']

export default function StatisticsPage() {
  const [stats, setStats] = useState<ClassStats[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([])
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0])

  // 초기 로딩 시에만 자동 조회
  useEffect(() => {
    fetchStatistics()
    fetchWeeklyStats()
    fetchAttendanceLogs()
  }, [])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/statistics?startDate=${startDate}&endDate=${endDate}`)
      if (!res.ok) {
        throw new Error('통계를 불러오는데 실패했습니다')
      }
      const data = await res.json()
      setStats(data.classStats || [])
    } catch (error) {
      console.error('통계를 불러오는데 실패했습니다:', error)
      setStats([])
    } finally {
      setLoading(false)
    }
  }

  const fetchWeeklyStats = async () => {
    try {
      const res = await fetch(`/api/statistics/weekly?startDate=${startDate}&endDate=${endDate}`)
      if (!res.ok) {
        throw new Error('주별 통계를 불러오는데 실패했습니다')
      }
      const data = await res.json()
      setWeeklyStats(data.weeklyStats || [])
    } catch (error) {
      console.error('주별 통계를 불러오는데 실패했습니다:', error)
      setWeeklyStats([])
    }
  }

  const fetchAttendanceLogs = async () => {
    try {
      const res = await fetch(`/api/attendance/daily?startDate=${startDate}&endDate=${endDate}`)
      if (!res.ok) {
        throw new Error('출석 일지를 불러오는데 실패했습니다')
      }
      const data = await res.json()
      setAttendanceLogs(data.logs || [])
    } catch (error) {
      console.error('출석 일지를 불러오는데 실패했습니다:', error)
      setAttendanceLogs([])
    }
  }

  // 조회 버튼 클릭 핸들러
  const handleFetch = () => {
    fetchStatistics()
    fetchWeeklyStats()
    fetchAttendanceLogs()
  }

  const chartData = stats.map(stat => ({
    name: stat.class.name,
    출석: stat.presentCount,
    결석: stat.absentCount
  }))

  const pieData = [
    { name: '출석', value: stats.reduce((sum, s) => sum + s.presentCount, 0) },
    { name: '결석', value: stats.reduce((sum, s) => sum + s.absentCount, 0) }
  ]

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-2 block">← 홈</Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">통계 및 리포트</h1>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">기간 설정</CardTitle>
            <CardDescription className="text-sm">통계를 확인할 기간을 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <Label htmlFor="startDate">시작일</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">종료일</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleFetch} disabled={loading} className="w-full">
              {loading ? '조회 중...' : '조회'}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 mb-6 md:gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">총 학생 수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{stats.reduce((sum, s) => sum + s.totalStudents, 0)}명</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">출석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.reduce((sum, s) => sum + s.presentCount, 0)}건</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">결석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-red-600">{stats.reduce((sum, s) => sum + s.absentCount, 0)}건</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 mb-6 md:gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">평균 출석률</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">
                {stats.length > 0
                  ? Math.round(stats.reduce((sum, s) => sum + s.attendanceRate, 0) / stats.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">총 출석 기록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{stats.reduce((sum, s) => sum + s.totalAttendances, 0)}건</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 mb-6 md:gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">반별 출석 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="출석" fill="#22c55e" />
                  <Bar dataKey="결석" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">전체 출석 비율</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      if (percent && name) {
                        return `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      return name
                    }}
                    outerRadius={80}
                    dataKey="value"
                    fontSize={12}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">주별 출석 학생 수</CardTitle>
            <CardDescription className="text-sm">기간별 전체 학생 출석 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === 'presentCount') {
                      return [`${value}명`, '출석']
                    }
                    if (name === 'totalStudents') {
                      return [`${value}명`, '전체 학생']
                    }
                    return [value, name]
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="presentCount"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="출석 학생 수"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">반별 상세 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.class.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{stat.class.name}</h3>
                      <p className="text-sm text-gray-600">{stat.class.teacherName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl md:text-2xl font-bold text-green-600">{stat.attendanceRate}%</div>
                      <p className="text-xs md:text-sm text-gray-600">출석률</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                    <div>
                      <span className="text-gray-600">학생 수:</span> {stat.totalStudents}명
                    </div>
                    <div>
                      <span className="text-gray-600">출석:</span> <span className="text-green-600 font-semibold">{stat.presentCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">결석:</span> <span className="text-red-600 font-semibold">{stat.absentCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">출석 일지</CardTitle>
            <CardDescription className="text-sm">기간 내 출석 기록 상세 내역</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">출석 일지가 없습니다</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">날짜</TableHead>
                      <TableHead>학생</TableHead>
                      <TableHead>반</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>내용 (Note)</TableHead>
                      <TableHead className="w-16 text-center">큐티</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceLogs.map((log, index) => (
                      <TableRow key={`${log.date}-${log.studentName}-${index}`}>
                        <TableCell className="text-sm">{log.date}</TableCell>
                        <TableCell className="font-medium">{log.studentName}</TableCell>
                        <TableCell className="text-sm text-gray-600">{log.className}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                              log.status === 'PRESENT'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {log.status === 'PRESENT' ? '출석' : '결석'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 max-w-48 truncate" title={log.note}>
                          {log.note || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {log.status === 'ABSENT' ? (
                            <span className="text-gray-400">-</span>
                          ) : log.isQuietTimeDone ? (
                            <span className="text-green-600 font-medium">✓</span>
                          ) : (
                            <span className="text-red-500 font-medium">✗</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
