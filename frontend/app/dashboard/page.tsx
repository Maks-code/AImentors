"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { UserCircle, MessageCircle, Users, Calendar, Settings, Star } from "lucide-react"

export default function DashboardHome() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full p-6 bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-700 animate-gradient">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Приветствие */}
        <Card className="bg-white/20 backdrop-blur-xl shadow-lg border border-white/30 p-6">
          <h1 className="text-2xl font-bold text-white">Добро пожаловать, [Имя пользователя] 👋</h1>
          <p className="text-white/80 mt-2">Ваш персональный центр обучения и общения с AI-менторами</p>
        </Card>

        {/* Быстрые действия */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card 
            onClick={() => router.push("/dashboard/chats")}
            className="cursor-pointer bg-white/20 hover:scale-105 hover:shadow-xl transition border border-white/30 backdrop-blur-xl text-center p-4"
          >
            <MessageCircle className="mx-auto h-8 w-8 text-indigo-300" />
            <p className="mt-2 text-sm text-white">Чаты</p>
          </Card>
          <Card 
            onClick={() => router.push("/dashboard/profile")}
            className="cursor-pointer bg-white/20 hover:scale-105 hover:shadow-xl transition border border-white/30 backdrop-blur-xl text-center p-4"
          >
            <UserCircle className="mx-auto h-8 w-8 text-indigo-300" />
            <p className="mt-2 text-sm text-white">Профиль</p>
          </Card>
          <Card 
            onClick={() => router.push("/dashboard/mentors")}
            className="cursor-pointer bg-white/20 hover:scale-105 hover:shadow-xl transition border border-white/30 backdrop-blur-xl text-center p-4"
          >
            <Users className="mx-auto h-8 w-8 text-indigo-300" />
            <p className="mt-2 text-sm text-white">Менторы</p>
          </Card>
          <Card 
            onClick={() => router.push("/dashboard/plan")}
            className="cursor-pointer bg-white/20 hover:scale-105 hover:shadow-xl transition border border-white/30 backdrop-blur-xl text-center p-4"
          >
            <Calendar className="mx-auto h-8 w-8 text-indigo-300" />
            <p className="mt-2 text-sm text-white">План</p>
          </Card>
          <Card 
            onClick={() => router.push("/dashboard/settings")}
            className="cursor-pointer bg-white/20 hover:scale-105 hover:shadow-xl transition border border-white/30 backdrop-blur-xl text-center p-4"
          >
            <Settings className="mx-auto h-8 w-8 text-indigo-300" />
            <p className="mt-2 text-sm text-white">Настройки</p>
          </Card>
        </div>

        {/* Заглушки */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg p-4">
            <CardHeader>
              <CardTitle className="text-white">Прогресс обучения</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">Здесь будет график прогресса по урокам</p>
              <div className="h-32 bg-white/10 rounded mt-4 flex items-center justify-center text-white/50">
                [Chart placeholder]
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg p-4">
            <CardHeader>
              <CardTitle className="text-white">Достижения</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">Ваши трофеи и бейджи</p>
              <div className="flex gap-3 mt-4">
                <Star className="text-yellow-400 w-8 h-8" />
                <Star className="text-yellow-400 w-8 h-8" />
                <Star className="text-gray-400 w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}