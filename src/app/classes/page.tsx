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

interface Class {
  id: number
  name: string
  teacherName: string
  _count: { students: number }
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({ name: '', teacherName: '' })

  useEffect(() => {
    fetchClasses()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingClass) {
        await fetch(`/api/classes/${editingClass.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }

      setDialogOpen(false)
      setEditingClass(null)
      setFormData({ name: '', teacherName: '' })
      fetchClasses()
    } catch (error) {
      console.error('반 저장에 실패했습니다:', error)
    }
  }

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({ name: classItem.name, teacherName: classItem.teacherName })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await fetch(`/api/classes/${id}`, { method: 'DELETE' })
      fetchClasses()
    } catch (error) {
      console.error('반 삭제에 실패했습니다:', error)
    }
  }

  const openCreateDialog = () => {
    setEditingClass(null)
    setFormData({ name: '', teacherName: '' })
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-2 block">← 홈</Link>
            <h1 className="text-3xl font-bold text-gray-900">반 관리</h1>
          </div>
          <Button onClick={openCreateDialog}>새 반 만들기</Button>
        </div>

        {loading ? (
          <p>로딩 중...</p>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">등록된 반이 없습니다</p>
              <Button onClick={openCreateDialog}>첫 번째 반 만들기</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>반 목록</CardTitle>
              <CardDescription>총 {classes.length}개의 반</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>반 이름</TableHead>
                    <TableHead>담당 선생님</TableHead>
                    <TableHead>학생 수</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">{classItem.name}</TableCell>
                      <TableCell>{classItem.teacherName}</TableCell>
                      <TableCell>{classItem._count.students}명</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(classItem)}>
                            수정
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(classItem.id)}>
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
              <DialogTitle>{editingClass ? '반 수정' : '새 반 만들기'}</DialogTitle>
              <DialogDescription>
                {editingClass ? '반 정보를 수정합니다' : '새로운 반을 만듭니다'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">반 이름</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 중1반"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="teacherName">담당 선생님</Label>
                  <Input
                    id="teacherName"
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    placeholder="담당 선생님 이름"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">{editingClass ? '수정' : '만들기'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
