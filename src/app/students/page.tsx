'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Student {
  id: number
  name: string
  phone: string | null
  class: {
    id: number
    name: string
  }
}

interface Class {
  id: number
  name: string
  teacherName: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({ name: '', phone: '', classId: '' })
  const [bulkClassId, setBulkClassId] = useState('')
  const [bulkNames, setBulkNames] = useState('')

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students')
      if (!res.ok) {
        throw new Error('학생 목록을 불러오는데 실패했습니다')
      }
      const data = await res.json()
      setStudents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('학생 목록을 불러오는데 실패했습니다:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      if (!res.ok) {
        throw new Error('반 목록을 불러오는데 실패했습니다')
      }
      const data = await res.json()
      setClasses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('반 목록을 불러오는데 실패했습니다:', error)
      setClasses([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingStudent) {
        await fetch(`/api/students/${editingStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }

      setDialogOpen(false)
      setEditingStudent(null)
      setFormData({ name: '', phone: '', classId: '' })
      fetchStudents()
    } catch (error) {
      console.error('학생 저장에 실패했습니다:', error)
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({ name: student.name, phone: student.phone || '', classId: student.class.id.toString() })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' })
      fetchStudents()
    } catch (error) {
      console.error('학생 삭제에 실패했습니다:', error)
    }
  }

  const openCreateDialog = () => {
    if (classes.length === 0) {
      alert('먼저 반을 만들어주세요!')
      return
    }
    setEditingStudent(null)
    setFormData({ name: '', phone: '', classId: '' })
    setDialogOpen(true)
  }

  const openBulkDialog = () => {
    if (classes.length === 0) {
      alert('먼저 반을 만들어주세요!')
      return
    }
    setBulkClassId('')
    setBulkNames('')
    setBulkDialogOpen(true)
  }

  const handleBulkSubmit = async () => {
    if (!bulkClassId) {
      alert('반을 선택해주세요!')
      return
    }
    if (!bulkNames.trim()) {
      alert('학생 이름을 입력해주세요!')
      return
    }

    const names = bulkNames.split('\n').map(n => n.trim()).filter(n => n.length > 0)

    if (names.length === 0) {
      alert('학생 이름을 입력해주세요!')
      return
    }

    try {
      const promises = names.map(name =>
        fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            classId: parseInt(bulkClassId)
          })
        })
      )

      await Promise.all(promises)
      setBulkDialogOpen(false)
      fetchStudents()
    } catch (error) {
      console.error('일괄 등록에 실패했습니다:', error)
      alert('일괄 등록에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-2 block">← 홈</Link>
            <h1 className="text-3xl font-bold text-gray-900">학생 관리</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openBulkDialog}>일괄 등록</Button>
            <Button onClick={openCreateDialog}>학생 추가</Button>
          </div>
        </div>

        {loading ? (
          <p>로딩 중...</p>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">등록된 학생이 없습니다</p>
              {classes.length === 0 ? (
                <Link href="/classes">
                  <Button>먼저 반 만들기</Button>
                </Link>
              ) : (
                <Button onClick={openCreateDialog}>첫 번째 학생 추가</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>학생 목록</CardTitle>
              <CardDescription>총 {students.length}명의 학생</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>연락처</TableHead>
                    <TableHead>소속 반</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.phone || '-'}</TableCell>
                      <TableCell>{student.class.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                            수정
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(student.id)}>
                            삭제
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStudent ? '학생 수정' : '새 학생 추가'}</DialogTitle>
              <DialogDescription>
                {editingStudent ? '학생 정보를 수정합니다' : '새로운 학생을 추가합니다'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="학생 이름"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="classId">소속 반</Label>
                  <select
                    id="classId"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">반을 선택해주세요</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="phone">연락처 (선택)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">{editingStudent ? '수정' : '추가'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>일괄 등록</DialogTitle>
              <DialogDescription>
                여러 학생을 한번에 등록합니다. 한 줄에 한 이름씩 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="bulkClassId">소속 반</Label>
                <select
                  id="bulkClassId"
                  value={bulkClassId}
                  onChange={(e) => setBulkClassId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">반을 선택해주세요</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="bulkNames">학생 이름 (한 줄에 한 이름씩)</Label>
                <textarea
                  id="bulkNames"
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  placeholder="홍길동&#10;김철수&#10;이영수"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bulkNames.split('\n').filter(n => n.trim()).length}명의 학생
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBulkDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleBulkSubmit}>
                {bulkNames.split('\n').filter(n => n.trim()).length}명 등록
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
