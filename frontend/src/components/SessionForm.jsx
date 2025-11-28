import { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../utils/api';
import { Calendar, Clock, Type, AlignLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const SessionForm = ({ onSessionCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 25,
        startTime: new Date()
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length > 100) {
            newErrors.title = 'Title must be less than 100 characters';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        if (formData.duration < 1 || formData.duration > 240) {
            newErrors.duration = 'Duration must be between 1 and 240 minutes';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const session = await api.post('/sessions/', {
                ...formData,
                duration: formData.duration * 60, // Convert to seconds
                start_time: formData.startTime.toISOString()
            });

            setFormData({ title: '', description: '', duration: 25, startTime: new Date() });
            setErrors({});

            if (onSessionCreated) {
                onSessionCreated(session);
            }
        } catch (error) {
            console.error('Error creating session:', error);
            setApiError(error.message || 'Failed to create session');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-[#09090b] p-6 rounded-xl border border-zinc-800">
            {apiError && (
                <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {apiError}
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="title" className="flex items-center space-x-2 text-sm font-medium text-zinc-400">
                    <Type className="w-4 h-4" />
                    <span>Title</span>
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900/50 border ${errors.title ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all placeholder:text-zinc-600`}
                    placeholder="What are you working on?"
                    disabled={isSubmitting}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="duration" className="flex items-center space-x-2 text-sm font-medium text-zinc-400">
                        <Clock className="w-4 h-4" />
                        <span>Duration (min)</span>
                    </label>
                    <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="1"
                        max="240"
                        className={`w-full bg-zinc-900/50 border ${errors.duration ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all`}
                        disabled={isSubmitting}
                    />
                    {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
                </div>

                <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-zinc-400">
                        <Calendar className="w-4 h-4" />
                        <span>Date</span>
                    </label>
                    <DatePicker
                        selected={formData.startTime}
                        onChange={(date) => setFormData(prev => ({ ...prev, startTime: date }))}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all cursor-pointer"
                        dateFormat="MMM d, yyyy"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="flex items-center space-x-2 text-sm font-medium text-zinc-400">
                    <AlignLeft className="w-4 h-4" />
                    <span>Description</span>
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full bg-zinc-900/50 border ${errors.description ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all placeholder:text-zinc-600 resize-none`}
                    placeholder="Add some details..."
                    disabled={isSubmitting}
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-zinc-100 text-zinc-900 font-medium py-2.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Creating...' : 'Create Session'}
            </button>
        </form>
    );
};

SessionForm.propTypes = {
    onSessionCreated: PropTypes.func,
};

export default SessionForm;
