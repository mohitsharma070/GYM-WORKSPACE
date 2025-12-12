import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Difficulty } from "../types/Exercise";
import { useCreateWorkoutPlan } from "../hooks/useWorkoutPlans"; // Correct hook for creating workout plans

interface AddWorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanAdded: () => void; // Callback to refetch plans after adding
}

export default function AddWorkoutPlanModal({
  isOpen,
  onClose,
  onPlanAdded,
}: AddWorkoutPlanModalProps) {
  const addWorkoutPlanMutation = useCreateWorkoutPlan();

  const [form, setForm] = useState({
    name: "",
    description: "",
    difficulty: Difficulty.BEGINNER, // Default difficulty
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        description: "",
        difficulty: Difficulty.BEGINNER,
      });
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addWorkoutPlanMutation.mutateAsync(form);
      onPlanAdded(); // Notify parent to refetch plans
      onClose(); // Close modal on success
    } catch (error) {
      alert("Failed to add workout plan.");
      console.error("Error adding workout plan:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Add New Workout Plan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Plan Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-gray-700 text-sm font-bold mb-2">
              Difficulty:
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {Object.values(Difficulty).map((diff) => (
                <option key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}