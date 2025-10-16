import React from 'react';

const LoginForm = ({onSubmit, onToggleMode}) => {
    const handleSubmit =(e) => {
        e.preventDefault();
        onSubmit('login');
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" 
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-transparent outline-none"/>
        </div>

        <div>
            
        </div>
    )
}