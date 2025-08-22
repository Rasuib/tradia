"use client"

import { useState } from "react"
import Notifications from "@/components/dashboard/notifications"
import type { Notification } from "@/types/dashboard"

interface NotificationsSidebarProps {
  initialNotifications: Notification[]
}

export default function NotificationsSidebar({ initialNotifications }: NotificationsSidebarProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const handleAddNotification = (notification: Omit<Notification, "id">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  return (
    <div className="relative">
      <Notifications
        initialNotifications={notifications}
        notifications={notifications}
        onAddNotification={handleAddNotification}
        onClearAll={handleClearAll}
        onDelete={handleDelete}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  )
}
