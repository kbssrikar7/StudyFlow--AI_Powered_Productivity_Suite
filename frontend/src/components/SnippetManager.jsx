import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Plus, Code2, Tag, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Layers } from 'lucide-react';

function SnippetManager() {
    const [snippets, setSnippets] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('// Write your code here...');
    const [tags, setTags] = useState('');
    const [expandedSnippetId, setExpandedSnippetId] = useState(null);

    useEffect(() => {
        fetchSnippets();
    }, []);

    const fetchSnippets = () => {
        fetch('http://localhost:8000/snippets/')
            .then((res) => res.json())
            .then((data) => setSnippets(data))
            .catch((err) => console.error('Error fetching snippets:', err));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newSnippet = { title, content, tags };

        fetch('http://localhost:8000/snippets/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSnippet),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to create snippet');
                return res.json();
            })
            .then((data) => {
                setSnippets([data, ...snippets]);
                setTitle('');
                setContent('// Write your code here...');
                setTags('');
            })
            .catch((err) => console.error(err));
    };

    const handlePractice = (id, e) => {
        e.stopPropagation(); // Prevent toggling accordion

        const updateData = {
            last_practiced_at: new Date().toISOString(),
            // next_review_at and repetition_level are handled by backend
        };

        fetch(`http://localhost:8000/snippets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to update snippet');
                return res.json();
            })
            .then((updatedSnippet) => {
                setSnippets(snippets.map((s) => (s.id === id ? updatedSnippet : s)));
            })
            .catch((err) => console.error(err));
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this snippet?')) return;

        fetch(`http://localhost:8000/snippets/${id}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to delete snippet');
                setSnippets(snippets.filter((s) => s.id !== id));
            })
            .catch((err) => console.error(err));
    };

    const toggleAccordion = (id) => {
        setExpandedSnippetId(expandedSnippetId === id ? null : id);
    };

    return (
        <div className="space-y-8">
            {/* Create Snippet Form */}
            <div className="bg-black/30 border border-zinc-800 rounded-xl p-6 shadow-sm backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-6 text-zinc-100">
                    <Plus className="w-5 h-5" />
                    <h2 className="text-lg font-bold tracking-tight">Add New Snippet</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-zinc-400 mb-2 text-xs font-medium uppercase tracking-wider">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 bg-zinc-900 text-zinc-100 rounded-md border border-zinc-800 focus:border-zinc-600 focus:ring-0 transition-all outline-none placeholder:text-zinc-600"
                            placeholder="e.g., Binary Search Implementation"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-400 mb-2 text-xs font-medium uppercase tracking-wider">Code / Content</label>
                        <div className="h-64 rounded-md overflow-hidden border border-zinc-800">
                            <Editor
                                height="100%"
                                defaultLanguage="python"
                                theme="vs-dark"
                                value={content}
                                onChange={(value) => setContent(value)}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    fontFamily: 'JetBrains Mono, monospace',
                                    scrollBeyondLastLine: false,
                                    padding: { top: 16 },
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-zinc-400 mb-2 text-xs font-medium uppercase tracking-wider">Tags (comma separated)</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full pl-10 p-3 bg-zinc-900 text-zinc-100 rounded-md border border-zinc-800 focus:border-zinc-600 focus:ring-0 transition-all outline-none placeholder:text-zinc-600"
                                placeholder="python, algorithms, leetcode"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-3 px-6 rounded-md shadow-sm transition-all duration-200"
                    >
                        Save Snippet
                    </button>
                </form>
            </div>

            {/* Snippets List */}
            <div className="grid grid-cols-1 gap-4">
                {snippets.map((snippet) => {
                    const isDue = snippet.next_review_at && new Date(snippet.next_review_at) <= new Date();
                    const isExpanded = expandedSnippetId === snippet.id;

                    return (
                        <div
                            key={snippet.id}
                            className={`bg-black/40 rounded-xl border ${isDue ? 'border-orange-900/50' : 'border-zinc-800'
                                } shadow-sm overflow-hidden transition-all hover:border-zinc-700 cursor-pointer backdrop-blur-sm`}
                            onClick={() => toggleAccordion(snippet.id)}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-lg ${isDue ? 'bg-orange-950/30 text-orange-500' : 'bg-zinc-900 text-zinc-400'}`}>
                                            <Code2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-100">{snippet.title}</h3>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <div className="flex items-center space-x-1 text-zinc-500 text-xs">
                                                    <Layers className="w-3 h-3" />
                                                    <span>Lvl {snippet.repetition_level || 0}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-zinc-400 text-xs font-medium">
                                                    <span className="text-zinc-600">|</span>
                                                    <span>Next Review: {snippet.next_review_at ? new Date(snippet.next_review_at).toLocaleDateString() : 'Tomorrow'}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {snippet.tags.split(',').map((tag, idx) => (
                                                        tag.trim() && (
                                                            <span key={idx} className="text-xs text-zinc-500">
                                                                #{tag.trim()}
                                                            </span>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        {isDue && (
                                            <div className="flex items-center space-x-1 text-orange-500 bg-orange-950/30 px-3 py-1 rounded-full border border-orange-900/50">
                                                <AlertCircle className="w-3 h-3" />
                                                <span className="text-xs font-medium">Review</span>
                                            </div>
                                        )}
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-6 animate-in slide-in-from-top-2 duration-200">
                                        <div className="h-64 rounded-md overflow-hidden border border-zinc-800 mb-4 opacity-90">
                                            <Editor
                                                height="100%"
                                                defaultLanguage="python"
                                                theme="vs-dark"
                                                value={snippet.content}
                                                options={{
                                                    readOnly: true,
                                                    minimap: { enabled: false },
                                                    fontSize: 13,
                                                    fontFamily: 'JetBrains Mono, monospace',
                                                    scrollBeyondLastLine: false,
                                                    domReadOnly: true,
                                                    renderLineHighlight: 'none',
                                                }}
                                            />
                                        </div>

                                        <div className="flex justify-between items-center text-sm text-zinc-500 border-t border-zinc-800 pt-4">
                                            <button
                                                onClick={(e) => handleDelete(snippet.id, e)}
                                                className="text-red-500 hover:text-red-400 text-xs font-medium transition-colors"
                                            >
                                                Delete Snippet
                                            </button>
                                            <button
                                                onClick={(e) => handlePractice(snippet.id, e)}
                                                className="flex items-center space-x-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Mark as Practiced</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {snippets.length === 0 && (
                    <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
                        <p className="text-sm">No snippets yet. Add one above.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SnippetManager;
