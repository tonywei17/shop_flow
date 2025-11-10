"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle, Lock, Menu, X } from "lucide-react";

// Mock data - 实际应该从数据库获取
const courseData = {
  id: "1",
  title: "リトミック基礎コース",
  videos: [
    { id: "v1", title: "第1章：リトミックとは", duration: "15:30", completed: true, vimeoId: "76979871" },
    { id: "v2", title: "第2章：基本的な動き", duration: "20:15", completed: true, vimeoId: "76979871" },
    { id: "v3", title: "第3章：リズムの理解", duration: "18:45", completed: false, vimeoId: "76979871" },
    { id: "v4", title: "第4章：実践演習", duration: "25:00", completed: false, vimeoId: "76979871" },
    { id: "v5", title: "第5章：応用テクニック", duration: "22:30", completed: false, vimeoId: "76979871" },
  ],
};

export default function LearnPage({ params }: { params: { id: string } }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentVideo = courseData.videos[currentVideoIndex];
  const progress = Math.round((courseData.videos.filter(v => v.completed).length / courseData.videos.length) * 100);

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${params.id}`}
            className="flex items-center gap-2 hover:text-blue-400"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">コースに戻る</span>
          </Link>
          <div className="border-l border-gray-700 pl-4">
            <h1 className="font-bold text-sm sm:text-base">{courseData.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <div className="text-sm text-gray-400">進捗:</div>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm font-medium">{progress}%</div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg md:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player */}
        <div className="flex-1 flex flex-col">
          {/* Vimeo Player */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <div className="w-full h-full">
              {/* Vimeo Embed - 使用iframe嵌入 */}
              <iframe
                src={`https://player.vimeo.com/video/${currentVideo.vimeoId}?h=0&title=0&byline=0&portrait=0`}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={currentVideo.title}
              />
            </div>
          </div>

          {/* Video Info & Controls */}
          <div className="bg-gray-900 text-white p-4 border-t border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">{currentVideo.title}</h2>
                <p className="text-sm text-gray-400">
                  {currentVideoIndex + 1} / {courseData.videos.length} · {currentVideo.duration}
                </p>
              </div>
              
              {!currentVideo.completed && (
                <button
                  onClick={() => {
                    // Mark as completed
                    console.log("Mark as completed");
                  }}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  完了にする
                </button>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentVideoIndex(Math.max(0, currentVideoIndex - 1))}
                disabled={currentVideoIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="hidden sm:inline">前のレッスン</span>
              </button>
              
              <button
                onClick={() => setCurrentVideoIndex(Math.min(courseData.videos.length - 1, currentVideoIndex + 1))}
                disabled={currentVideoIndex === courseData.videos.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">次のレッスン</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <div
          className={`${
            sidebarOpen ? "w-full md:w-80" : "w-0"
          } bg-gray-900 border-l border-gray-800 overflow-hidden transition-all absolute md:relative inset-y-0 right-0 z-10`}
        >
          <div className="h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-bold text-white mb-2">コース内容</h3>
              <div className="text-sm text-gray-400">
                {courseData.videos.filter(v => v.completed).length} / {courseData.videos.length} 完了
              </div>
            </div>
            
            <div className="divide-y divide-gray-800">
              {courseData.videos.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() => setCurrentVideoIndex(index)}
                  className={`w-full text-left p-4 hover:bg-gray-800 transition-colors ${
                    index === currentVideoIndex ? "bg-gray-800" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {video.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : index === currentVideoIndex ? (
                        <div className="h-5 w-5 rounded-full border-2 border-blue-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium mb-1 ${
                        index === currentVideoIndex ? "text-blue-400" : "text-white"
                      }`}>
                        {video.title}
                      </div>
                      <div className="text-sm text-gray-400">{video.duration}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
