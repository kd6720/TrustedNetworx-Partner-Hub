"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle2, ChevronLeft, ChevronRight, Monitor, Clock, BookOpen, FileEdit } from "lucide-react";
import { docSections, type DocSection, type Lesson } from "@/data/documentation";

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  // Persist completions in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("docs_completed");
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  function markComplete(title: string) {
    const next = completed.includes(title) ? completed : [...completed, title];
    setCompleted(next);
    localStorage.setItem("docs_completed", JSON.stringify(next));
  }

  function isComplete(title: string) { return completed.includes(title); }

  const section = docSections[activeSection];
  const lesson = section.lessons[activeLesson];
  const totalLessons = docSections.reduce((sum, s) => sum + s.lessons.length, 0);
  const completedCount = docSections.reduce(
    (sum, s) => sum + s.lessons.filter(l => isComplete(l.title)).length, 0
  );

  return (
    <div className="flex gap-6">
      {/* Left sidebar */}
      <div className="w-64 flex-shrink-0">
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search docs..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]" />
        </div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Documentation</p>
        <div className="space-y-1">
          {docSections.map((s, si) => (
            <div key={si}>
              <button onClick={() => { setActiveSection(si); setActiveLesson(0); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  si === activeSection ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}>
                {s.title}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Center content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <span>Documentation</span><span>/</span><span>{section.title}</span><span>/</span>
          <span className="text-gray-700">{lesson.title}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              {lesson.draft && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  <FileEdit size={10} /> Draft
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Estimated duration: {lesson.duration}</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Monitor size={16} /> Present
          </button>
        </div>

        {/* Lesson content */}
        {lesson.content ? (
          <div className="card p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">What we cover here</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                Key concepts and terminology for this topic
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                Step-by-step walkthrough of the process
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                Best practices and common pitfalls to avoid
              </li>
            </ul>
          </div>
        ) : null}

        <div className="card p-6 mb-4">
          <div className="prose prose-sm max-w-none text-gray-600">
            {lesson.content ? (
              <div className="whitespace-pre-line">{lesson.content}</div>
            ) : (
              <div className="text-center py-8">
                <FileEdit size={24} className="mx-auto mb-3 text-amber-400" />
                <p className="text-gray-500">
                  This lesson is a draft and content is being developed.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Check back soon for real POTS replacement, hosted voice, and compliance training content.
                </p>
              </div>
            )}
            {!lesson.draft && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
                <p className="text-sm font-semibold text-amber-900 mb-1">Important</p>
                <p className="text-sm text-amber-800">
                  Make sure you have completed the prerequisite lessons before proceeding.
                  Contact your partner success manager if you need assistance.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related articles */}
        {section.lessons.filter((_, i) => i !== activeLesson).length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {section.lessons.filter((_, i) => i !== activeLesson).slice(0, 3).map((l, i) => (
              <div key={i} className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setActiveLesson(section.lessons.indexOf(l))}>
                <BookOpen size={18} className="text-[var(--color-brand-primary)] mb-2" />
                <p className="text-sm font-medium text-gray-900">{l.title}</p>
                <p className="text-xs text-[var(--color-brand-primary)] mt-1">Read more</p>
              </div>
            ))}
          </div>
        )}

        {/* Prev/Next */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <button disabled={activeLesson === 0} onClick={() => setActiveLesson(activeLesson - 1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">
            <ChevronLeft size={16} /> Previous
          </button>
          <button onClick={() => { markComplete(lesson.title);
            if (activeLesson < section.lessons.length - 1) setActiveLesson(activeLesson + 1);
            else if (activeSection < docSections.length - 1) { setActiveSection(activeSection + 1); setActiveLesson(0); }
          }}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Mark as completed <CheckCircle2 size={16} />
          </button>
          <button disabled={activeLesson === section.lessons.length - 1 && activeSection === docSections.length - 1}
            onClick={() => { if (activeLesson < section.lessons.length - 1) setActiveLesson(activeLesson + 1);
              else if (activeSection < docSections.length - 1) { setActiveSection(activeSection + 1); setActiveLesson(0); }
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Right progress card */}
      <div className="w-56 flex-shrink-0">
        <div className="card p-4 sticky top-20">
          <p className="text-sm font-semibold text-gray-900 mb-1">{section.title}</p>
          <p className="text-xs text-gray-500 mb-3">
            {section.lessons.length} lessons · Approx. {section.lessons.reduce((sum, l) => sum + parseInt(l.duration), 0)} min
          </p>
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Your progress</span><span>{Math.round((completedCount / totalLessons) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full">
              <div className="h-full bg-[var(--color-brand-primary)] rounded-full transition-all"
                style={{ width: `${(completedCount / totalLessons) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            {section.lessons.map((l, i) => (
              <div key={i} onClick={() => setActiveLesson(i)}
                className={`flex items-center justify-between text-sm cursor-pointer rounded-lg p-1.5 ${
                  i === activeLesson ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] font-medium" : "text-gray-600 hover:bg-gray-50"
                }`}>
                <span className="flex items-center gap-2">
                  {isComplete(l.title) ? <CheckCircle2 size={14} className="text-green-500" /> :
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />}
                  <span className="text-xs truncate max-w-[120px]">{l.title}</span>
                </span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock size={10} /> {l.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
