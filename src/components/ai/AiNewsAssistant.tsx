import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Languages,
  FileText,
  Tag,
  Search,
  Check,
  Flame,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Copy,
} from 'lucide-react';
import { AiActionType, AiAssistantRequest } from '../../types/news';
import { api } from '../../lib/api';

interface AiNewsAssistantProps {
  currentHeadline: string;
  currentContent: string;
  currentCategory: string;
  onApplyHeadline: (headline: string) => void;
  onApplyDescription: (desc: string) => void;
  onApplyContent: (content: string) => void;
  onApplyTags: (tags: string[]) => void;
  onApplySeo: (seo: { title: string; description: string; keywords: string[] }) => void;
  onClose?: () => void;
}

export const AiNewsAssistant: React.FC<AiNewsAssistantProps> = ({
  currentHeadline,
  currentContent,
  currentCategory,
  onApplyHeadline,
  onApplyDescription,
  onApplyContent,
  onApplyTags,
  onApplySeo,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<AiActionType>('headline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const tools: { id: AiActionType; label: string; icon: any; desc: string }[] = [
    {
      id: 'headline',
      label: 'News Headlines',
      icon: Flame,
      desc: 'Generate 4 high-impact headlines (Breaking, Wire, SEO, Hindi)',
    },
    {
      id: 'hindi_grammar',
      label: 'Improve Hindi Grammar',
      icon: Languages,
      desc: 'Proofread Devanagari spellings, matras, and formal news phrasing',
    },
    {
      id: 'description',
      label: 'Short Description',
      icon: FileText,
      desc: 'Craft a crisp 2-sentence journalistic summary',
    },
    {
      id: 'rewrite',
      label: 'Professional Rewrite',
      icon: Bot,
      desc: 'Restructure draft into inverted-pyramid news wire prose',
    },
    {
      id: 'seo_title_desc',
      label: 'SEO Title & Meta',
      icon: Search,
      desc: 'Generate Google News snippet title and high-CTR meta description',
    },
    {
      id: 'tags',
      label: 'Generate Tags',
      icon: Tag,
      desc: 'Generate 8-12 trending keywords in English & Hindi',
    },
    {
      id: 'summarize',
      label: 'Fact Bullets Summary',
      icon: Sparkles,
      desc: 'Extract key verified takeaways into bullet points',
    },
  ];

  const handleRunAi = async (actionToRun: AiActionType = activeTab) => {
    if (!currentHeadline && !currentContent) {
      setError('Please provide at least a Headline or Story Content in the editor first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: AiAssistantRequest = {
        action: actionToRun,
        title: currentHeadline,
        content: currentContent,
        category: currentCategory,
      };

      const res = await api.runAiAssistant(payload);
      if (res.success) {
        setResult(res.result);
      } else {
        setError(res.error || 'AI generation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with AI Assistant server');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <span>Fastzlive AI News Assistant</span>
              <span className="text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900">
                Gemini 3.8
              </span>
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Editorial-grade news rewriting and Hindi enhancement
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Mandatory Fact Preservation Warning */}
      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 px-4 py-2 text-xs text-amber-800 dark:text-amber-300">
        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <span className="text-[11px] leading-tight">
          <strong>Editorial Rule:</strong> AI preserves original facts and strictly avoids inventing quotes or data. News editors must review and verify all output before publishing.
        </span>
      </div>

      {/* Tool Tabs Bar */}
      <div className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1.5 gap-1 scrollbar-none">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isSelected = activeTab === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTab(tool.id);
                setResult(null);
                setError(null);
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-neutral-900 text-white dark:bg-red-600 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Prompt Area */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Active Tool
            </h4>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {tools.find((t) => t.id === activeTab)?.desc}
            </p>
          </div>

          <button
            onClick={() => handleRunAi(activeTab)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Run {tools.find((t) => t.id === activeTab)?.label}</span>
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Generation Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => handleRunAi(activeTab)}
              className="text-xs font-bold underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 animate-pulse">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6"></div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-4/6"></div>
          </div>
        )}

        {/* Results Container */}
        {result && !loading && (
          <div className="space-y-4">
            {/* Tool: Headlines */}
            {activeTab === 'headline' && Array.isArray(result) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
                  <span>Generated Options ({result.length}):</span>
                  <span>Click to Apply Directly</span>
                </div>
                {result.map((hl: string, index: number) => {
                  const styleLabels = [
                    'Breaking / Urgent (आज तक / ABP Style)',
                    'National Broadcaster Style',
                    'High CTR / SEO Headline',
                    'Devanagari Hindi Headline',
                  ];
                  return (
                    <div
                      key={index}
                      className="group flex flex-col justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 p-3 hover:border-red-500 hover:bg-red-50/40 dark:hover:bg-red-950/20 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                          {styleLabels[index] || `Style ${index + 1}`}
                        </span>
                        <button
                          onClick={() => copyToClipboard(hl, `hl-${index}`)}
                          className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center gap-1"
                        >
                          {copiedKey === `hl-${index}` ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 font-hindi leading-snug">
                        {hl}
                      </p>
                      <div className="mt-2.5 flex justify-end">
                        <button
                          onClick={() => {
                            onApplyHeadline(hl);
                            setCopiedKey(`applied-${index}`);
                            setTimeout(() => setCopiedKey(null), 2000);
                          }}
                          className="flex items-center gap-1 rounded-md bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 text-white px-2.5 py-1 text-xs font-bold hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>
                            {copiedKey === `applied-${index}` ? 'Applied!' : 'Apply to Headline'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tool: Hindi Grammar */}
            {activeTab === 'hindi_grammar' && (
              <div className="space-y-3">
                {result.improvedTitle && (
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
                    <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                      Polished Hindi Headline
                    </p>
                    <p className="text-sm font-bold font-hindi mt-1 text-neutral-900 dark:text-neutral-100">
                      {result.improvedTitle}
                    </p>
                    <button
                      onClick={() => onApplyHeadline(result.improvedTitle)}
                      className="mt-2 text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <ArrowRight className="h-3 w-3" /> Apply Title
                    </button>
                  </div>
                )}

                {result.improvedContent && (
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase">
                      Polished Hindi Story Content
                    </p>
                    <div
                      className="mt-1 text-xs text-neutral-800 dark:text-neutral-200 font-hindi leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line"
                    >
                      {result.improvedContent}
                    </div>
                    <button
                      onClick={() => onApplyContent(result.improvedContent)}
                      className="mt-3 flex items-center gap-1.5 rounded-md bg-red-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Apply Polished Content</span>
                    </button>
                  </div>
                )}

                {result.changesMade && (
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold">Grammar Adjustments: </span>
                    <span>{typeof result.changesMade === 'string' ? result.changesMade : JSON.stringify(result.changesMade)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tool: Short Description */}
            {activeTab === 'description' && (
              <div className="space-y-3">
                {result.englishDescription && (
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase">
                      English News Lead
                    </p>
                    <p className="mt-1 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      {result.englishDescription}
                    </p>
                    <button
                      onClick={() => onApplyDescription(result.englishDescription)}
                      className="mt-2 text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" /> Apply English Lead
                    </button>
                  </div>
                )}

                {result.hindiDescription && (
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
                    <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                      हिंदी विवरण (Hindi Description)
                    </p>
                    <p className="mt-1 text-xs font-hindi text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      {result.hindiDescription}
                    </p>
                    <button
                      onClick={() => onApplyDescription(result.hindiDescription)}
                      className="mt-2 text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" /> Apply Hindi Lead
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tool: Rewrite */}
            {activeTab === 'rewrite' && (
              <div className="space-y-3">
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-red-600 uppercase">
                      Rewritten Wire Report
                    </span>
                    {result.wordCount && (
                      <span className="text-[10px] text-neutral-400">
                        {result.wordCount} words
                      </span>
                    )}
                  </div>
                  {result.rewrittenTitle && (
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1 mb-2">
                      {result.rewrittenTitle}
                    </p>
                  )}
                  <div
                    className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed max-h-64 overflow-y-auto prose dark:prose-invert prose-xs"
                    dangerouslySetInnerHTML={{ __html: result.rewrittenHtml || result }}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => onApplyContent(result.rewrittenHtml || result)}
                      className="flex items-center gap-1 rounded-md bg-red-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Apply Rewritten Prose</span>
                    </button>
                    {result.rewrittenTitle && (
                      <button
                        onClick={() => onApplyHeadline(result.rewrittenTitle)}
                        className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        Apply Title Only
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tool: SEO Title & Desc */}
            {activeTab === 'seo_title_desc' && (
              <div className="space-y-3">
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase">
                        SEO Meta Title ({result.seoTitle?.length || 0} chars)
                      </p>
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                        {result.seoTitle}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase">
                        SEO Description ({result.seoDescription?.length || 0} chars)
                      </p>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5">
                        {result.seoDescription}
                      </p>
                    </div>

                    {result.seoKeywords && Array.isArray(result.seoKeywords) && (
                      <div>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase">
                          Keywords:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.seoKeywords.map((kw: string, i: number) => (
                            <span
                              key={i}
                              className="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-700 dark:text-neutral-300"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onApplySeo({
                        title: result.seoTitle,
                        description: result.seoDescription,
                        keywords: result.seoKeywords || [],
                      });
                    }}
                    className="mt-3 flex items-center gap-1.5 rounded-md bg-red-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Apply All SEO Meta</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tool: Tags */}
            {activeTab === 'tags' && Array.isArray(result) && (
              <div className="space-y-3">
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Recommended High-Traffic News Tags ({result.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900 px-2.5 py-1 text-xs font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onApplyTags(result)}
                    className="mt-4 flex items-center gap-1.5 rounded-md bg-red-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Apply Tags to Article</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tool: Summarize */}
            {activeTab === 'summarize' && (
              <div className="space-y-3">
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
                  {result.takeaway && (
                    <div className="mb-2 p-2 bg-neutral-200/60 dark:bg-neutral-800/60 rounded-lg text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      ⚡ Key Takeaway: {result.takeaway}
                    </div>
                  )}

                  {result.summaryBullets && (
                    <div className="space-y-1 mt-2">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase">
                        Core Facts (English):
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-800 dark:text-neutral-200">
                        {result.summaryBullets.map((b: string, i: number) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.hindiSummaryBullets && (
                    <div className="space-y-1 mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <p className="text-[10px] font-bold text-red-600 uppercase font-hindi">
                        मुख्य बिंदु (हिंदी):
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-800 dark:text-neutral-200 font-hindi">
                        {result.hindiSummaryBullets.map((b: string, i: number) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
