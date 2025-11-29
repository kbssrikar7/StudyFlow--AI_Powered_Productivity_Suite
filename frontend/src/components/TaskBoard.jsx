import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';
import React from 'react';

const PriorityDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const priorities = [
        { value: 'low', label: 'Low', color: 'text-red-300' },
        { value: 'medium', label: 'Medium', color: 'text-red-400' },
        { value: 'high', label: 'Hard', color: 'text-red-500' }
    ];

    const currentPriority = priorities.find(p => p.value === value) || priorities[1];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="bg-black/40 border border-white/10  px-4 py-3 text-white/70 focus:outline-none focus:border-red-600/50 flex items-center gap-2 min-w-[120px] justify-between"
            >
                <span className={currentPriority.color}>{currentPriority.label}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-full bg-[#0a0a0a] border border-white/10  overflow-hidden z-[100] shadow-xl">
                    {priorities.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => {
                                onChange(p.value);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm transition-colors flex items-center gap-2"
                        >
                            <span className={clsx("w-2 h-2",
                                p.value === 'low' ? 'bg-red-300' :
                                    p.value === 'medium' ? 'bg-red-400' : 'bg-red-500'
                            )} />
                            <span className="text-white/80">{p.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const SortableTask = React.memo(({ task, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id, data: { task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={clsx(
                "bg-black/40 border border-white/5 p-4  shadow-arkham group hover:border-red-600/30 hover:shadow-bat-glow transition-all cursor-grab active:cursor-grabbing will-change-transform",
                isDragging ? "opacity-60" : "opacity-100"
            )}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white tracking-tight">{task.title}</h4>
                    {task.description && (
                        <p className="text-xs text-white/60 mt-1">{task.description}</p>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag start
                        onDelete(task.id);
                    }}
                    className="text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
                <span className={clsx(
                    "text-[10px] px-3 py-0.5 uppercase tracking-[0.4em] font-bold",
                    task.priority === 'high' ? "bg-red-900/40 text-red-200 border border-red-800/50" :
                        task.priority === 'medium' ? "bg-red-600/20 text-red-400 border border-red-600/30" :
                            "bg-red-500/10 text-red-300 border border-red-500/20"
                )}>
                    {task.priority}
                </span>
                <GripVertical className="w-4 h-4 text-white/30" />
            </div>
        </div>
    );
});

const DroppableColumn = ({ id, title, tasks, onDelete }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="bg-black/30 border border-white/5  p-4 flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white text-xs uppercase tracking-[0.5em]">{title}</h3>
                <span className="bg-white/5 text-white/70 text-xs px-3 py-1 border border-white/10">{tasks.length}</span>
            </div>

            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 flex-1">
                    {tasks.map(task => (
                        <SortableTask key={task.id} task={task} onDelete={onDelete} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="h-full border-2 border-dashed border-white/10  flex items-center justify-center text-white/30 text-sm uppercase tracking-[0.4em]">
                            Drop here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

function TaskBoard() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', priority: 'medium', status: 'todo' });
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const data = await api.get('/tasks/');
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            toast.error('Failed to load tasks');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;

        try {
            const created = await api.post('/tasks/', newTask);
            setTasks([...tasks, created]);
            setNewTask({ ...newTask, title: '' });
            toast.success('Task created');
        } catch (error) {
            console.error('Failed to create task:', error);
            toast.error('Failed to create task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter(t => t.id !== taskId));
            toast.success('Task deleted');
        } catch (error) {
            console.error('Failed to delete task:', error);
            toast.error('Failed to delete task');
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // Use loose equality (==) to handle potential string/number mismatches from dnd-kit
        const activeTask = tasks.find(t => t.id == active.id);
        if (!activeTask) return;

        let newStatus = activeTask.status;
        const overTask = tasks.find(t => t.id == over.id);

        if (overTask) {
            newStatus = overTask.status;
        } else {
            // Check if dropped on a column container
            if (['todo', 'doing', 'done'].includes(over.id)) {
                newStatus = over.id;
            }
        }

        if (activeTask.status !== newStatus) {
            // Optimistic update
            const updatedTasks = tasks.map(t =>
                t.id == activeTask.id ? { ...t, status: newStatus } : t
            );
            setTasks(updatedTasks);

            try {
                await api.put(`/tasks/${activeTask.id}`, { status: newStatus });
                toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
            } catch (error) {
                console.error('Failed to update task status:', error);
                toast.error('Failed to move task');
                fetchTasks(); // Revert on error
            }
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-full flex flex-col space-y-6">
                <form onSubmit={handleCreateTask} className="flex flex-wrap gap-4 bg-black/30 border border-white/5  p-4">
                    <input
                        type="text"
                        placeholder="Log a new mission..."
                        className="flex-1 min-w-[200px] bg-transparent border border-white/10  px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-red-600/50"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />

                    <PriorityDropdown
                        value={newTask.priority}
                        onChange={(val) => setNewTask({ ...newTask, priority: val })}
                    />

                    <button
                        type="submit"
                        className="btn-primary flex items-center gap-2 px-6 py-3 "
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                    <DroppableColumn id="todo" title="To Do" tasks={tasks.filter(t => t.status === 'todo')} onDelete={handleDeleteTask} />
                    <DroppableColumn id="doing" title="In Progress" tasks={tasks.filter(t => t.status === 'doing')} onDelete={handleDeleteTask} />
                    <DroppableColumn id="done" title="Done" tasks={tasks.filter(t => t.status === 'done')} onDelete={handleDeleteTask} />
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="bg-black/80 border border-white/10 p-4  shadow-bat-glow opacity-80 rotate-2 cursor-grabbing">
                            <h4 className="text-sm font-medium text-white">
                                {tasks.find(t => t.id == activeId)?.title}
                            </h4>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}

export default TaskBoard;
