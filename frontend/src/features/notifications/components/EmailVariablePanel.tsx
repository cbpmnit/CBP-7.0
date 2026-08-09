"use client"

import React, { useState } from "react"
import { EMAIL_VARIABLES } from "../constants/emailVariables"
import { CBP_CUSTOM_BLOCKS, CBP_MEDIA_ASSETS } from "../constants/cbpBlocks"
import { VariableCategory } from "../types"
import {
  FiPlus,
  FiSearch,
  FiCode,
  FiUser,
  FiCreditCard,
  FiClock,
  FiAward,
  FiLayers,
  FiImage,
  FiMove,
  FiCopy,
  FiCheck,
  FiEye,
} from "react-icons/fi"

interface Props {
  onInsertVariable: (variableKey: string) => void
  onInsertHtmlBlock?: (html: string) => void
}

const CATEGORY_TABS: { key: "ALL" | VariableCategory; label: string; icon: React.ReactNode }[] = [
  { key: "ALL", label: "All", icon: <FiCode /> },
  { key: "STUDENT", label: "Student", icon: <FiUser /> },
  { key: "PAYMENT", label: "Payment", icon: <FiCreditCard /> },
  { key: "ATTENDANCE", label: "Attendance", icon: <FiClock /> },
  { key: "CERTIFICATE", label: "Certificate", icon: <FiAward /> },
]

export function EmailVariablePanel({ onInsertVariable, onInsertHtmlBlock }: Props) {
  const [mainTab, setMainTab] = useState<"VARIABLES" | "CBP_BLOCKS" | "MEDIA">("VARIABLES")
  const [activeVarTab, setActiveVarTab] = useState<"ALL" | VariableCategory>("ALL")
  const [search, setSearch] = useState("")
  const [showDeveloperTags, setShowDeveloperTags] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const filteredVariables = EMAIL_VARIABLES.filter((v) => {
    const matchesTab = activeVarTab === "ALL" || v.category === activeVarTab
    const matchesSearch =
      !search.trim() ||
      v.label.toLowerCase().includes(search.toLowerCase()) ||
      v.key.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const handleDragStart = (e: React.DragEvent, text: string) => {
    e.dataTransfer.setData("text/plain", text)
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col h-full space-y-3">
      {/* Top Main Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
        <button
          type="button"
          onClick={() => setMainTab("VARIABLES")}
          className={`py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1 cursor-pointer ${
            mainTab === "VARIABLES"
              ? "bg-white text-slate-900 shadow-2xs font-extrabold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FiCode className="text-xs" /> Dynamic Tags
        </button>

        <button
          type="button"
          onClick={() => setMainTab("CBP_BLOCKS")}
          className={`py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1 cursor-pointer ${
            mainTab === "CBP_BLOCKS"
              ? "bg-white text-slate-900 shadow-2xs font-extrabold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FiLayers className="text-xs" /> CBP Blocks
        </button>

        <button
          type="button"
          onClick={() => setMainTab("MEDIA")}
          className={`py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1 cursor-pointer ${
            mainTab === "MEDIA"
              ? "bg-white text-slate-900 shadow-2xs font-extrabold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FiImage className="text-xs" /> Media
        </button>
      </div>

      {/* SEARCH & DEVELOPER TOGGLE INPUT */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              mainTab === "VARIABLES"
                ? "Search tags..."
                : mainTab === "CBP_BLOCKS"
                ? "Search layout blocks..."
                : "Search media assets..."
            }
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
          />
          <FiSearch className="absolute left-2.5 top-2.5 text-slate-400 text-xs" />
        </div>

        {mainTab === "VARIABLES" && (
          <button
            type="button"
            onClick={() => setShowDeveloperTags(!showDeveloperTags)}
            className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition border cursor-pointer ${
              showDeveloperTags
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
            title="Toggle raw developer {{tag}} view"
          >
            {"{}"} Code
          </button>
        )}
      </div>

      {/* 1. DYNAMIC VARIABLES TAB */}
      {mainTab === "VARIABLES" && (
        <>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 shrink-0">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveVarTab(tab.key)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition shrink-0 inline-flex items-center gap-1 cursor-pointer ${
                  activeVarTab === tab.key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {filteredVariables.map((v) => (
              <div
                key={v.key}
                draggable
                onDragStart={(e) => handleDragStart(e, `{{${v.key}}}`)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-cyan-500 hover:shadow-2xs transition group flex items-start justify-between gap-2 cursor-grab active:cursor-grabbing"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <FiMove className="text-slate-400 text-xs shrink-0 group-hover:text-cyan-600" />
                    <span className="font-extrabold text-xs text-slate-900 truncate">{v.label}</span>
                    <span className="font-mono text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 shrink-0">
                      {v.category}
                    </span>
                  </div>

                  {showDeveloperTags ? (
                    <p className="text-[10px] font-mono font-bold text-cyan-900 mt-0.5">
                      {"{{" + v.key + "}}"}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                      {v.description} &middot; <span className="font-mono text-slate-400">e.g. &quot;{v.exampleValue}&quot;</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onInsertVariable(v.key)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-bold uppercase tracking-wider transition shrink-0 inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                  title={`Insert ${v.label}`}
                >
                  <FiPlus /> Insert
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 2. REUSABLE VISUAL CBP CUSTOM BLOCKS TAB */}
      {mainTab === "CBP_BLOCKS" && (
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          {CBP_CUSTOM_BLOCKS.map((block) => (
            <div
              key={block.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-purple-500 hover:shadow-md transition space-y-2 group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 group-hover:text-purple-700 transition">
                  <FiLayers className="text-purple-700 text-xs shrink-0" /> {block.title}
                </span>
                <span className="text-[9px] font-bold uppercase bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.2 rounded shrink-0">
                  {block.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{block.description}</p>

              {/* Visual Card Preview Box */}
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-400 overflow-hidden line-clamp-2 select-none opacity-80">
                Visual pre-designed block template ({block.title})
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onInsertHtmlBlock) onInsertHtmlBlock(block.htmlSnippet)
                  else onInsertVariable(block.htmlSnippet)
                }}
                className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
              >
                <FiPlus /> Add {block.title} Block
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. MEDIA ASSETS LIBRARY TAB */}
      {mainTab === "MEDIA" && (
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-[11px] text-cyan-900 font-semibold flex items-center justify-between">
            <span>Click to copy asset URL for image blocks</span>
          </div>

          {CBP_MEDIA_ASSETS.map((asset) => (
            <div
              key={asset.name}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{asset.name}</h4>
                <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{asset.url}</p>
              </div>

              <button
                type="button"
                onClick={() => handleCopyUrl(asset.url)}
                className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold transition inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedUrl === asset.url ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                <span>{copiedUrl === asset.url ? "Copied" : "Copy URL"}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmailVariablePanel
