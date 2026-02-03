'use client'

import React from 'react'
import { HomeIcon, DocumentTextIcon, ClockIcon, BoltIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

export default function Sidebar() {
    const menuItems = [
        { name: 'Dashboard', icon: HomeIcon, active: true },
        { name: 'Docs', icon: DocumentTextIcon, active: false },
        { name: 'Log', icon: ClockIcon, active: false },
    ]

    return (
        <div className="w-64 bg-klaus-sidebar border-r border-klaus-border h-screen flex flex-col flex-shrink-0 fixed left-0 top-0 z-50">
            {/* Profile Section */}
            <div className="p-6 flex flex-col items-center border-b border-klaus-border/50">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center mb-3 shadow-lg ring-2 ring-klaus-border">
                    <span className="text-2xl">😉</span>
                </div>
                <h2 className="text-klaus-text font-bold text-lg">V3ktor</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-klaus-muted font-medium">Online</span>
                </div>

                <button className="mt-4 w-full py-2 bg-klaus-card hover:bg-slate-700 text-klaus-text text-xs font-semibold rounded-lg border border-klaus-border transition-all">
                    Ready for tasks
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.name}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${item.active
                                ? 'bg-klaus-card text-ft-light border border-ft-light/20 shadow-sm'
                                : 'text-klaus-muted hover:text-klaus-text hover:bg-klaus-card/50'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </button>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-klaus-border/50">
                <button className="w-full flex items-center justify-center gap-2 text-klaus-muted hover:text-red-400 text-xs font-medium transition-colors p-2">
                    <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    )
}
