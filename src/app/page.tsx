import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">청소년부 출석부</h1>
          <p className="text-sm md:text-base text-gray-600">교회 청소년부 출석 관리 시스템</p>
        </header>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">반 관리</CardTitle>
              <CardDescription className="text-sm">반과 담당 선생님을 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/classes">
                <Button className="w-full">반 관리하기</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">학생 관리</CardTitle>
              <CardDescription className="text-sm">학생 정보를 등록하고 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/students">
                <Button className="w-full">학생 관리하기</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">출석 체크</CardTitle>
              <CardDescription className="text-sm">주일별 출석을 체크합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/attendance">
                <Button className="w-full" variant="outline">출석 체크하기</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">통계 및 리포트</CardTitle>
              <CardDescription className="text-sm">출석률과 통계를 확인합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/statistics">
                <Button className="w-full" variant="outline">통계 보기</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
