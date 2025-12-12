import { useState, useEffect } from "react";
import { type WorkoutPlan, type WorkoutPlanRequest, type WorkoutDayRequest, type WorkoutExerciseRequest } from "../types/WorkoutPlan";
import { Difficulty } from "../types/Exercise";
import { useUpdateWorkoutPlan, useAddWorkoutDayToPlan, useUpdateWorkoutDay, useDeleteWorkoutDay, useAddExerciseToWorkoutDay, useUpdateWorkoutExercise, useRemoveExerciseFromWorkoutDay } from "../hooks/useWorkoutPlans";
import { X, Plus, Edit2, Trash2 } from "lucide-react";
import { fetchAllExercises } from "../api/exercises";
import { type Exercise } from "../types/Exercise"; // Changed to type-only import

interface EditWorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutPlan: WorkoutPlan;
}

export default function EditWorkoutPlanModal({ isOpen, onClose, workoutPlan }: EditWorkoutPlanModalProps) {
  const [name, setName] = useState(workoutPlan.name);
  const [description, setDescription] = useState(workoutPlan.description || "");
  const [difficulty, setDifficulty] = useState<Difficulty>(workoutPlan.difficulty);
  const [workoutDays, setWorkoutDays] = useState(workoutPlan.workoutDays);

  const updateWorkoutPlanMutation = useUpdateWorkoutPlan();
  const addWorkoutDayMutation = useAddWorkoutDayToPlan();
  const updateWorkoutDayMutation = useUpdateWorkoutDay(); // Still declared
  const deleteWorkoutDayMutation = useDeleteWorkoutDay();
  const addExerciseMutation = useAddExerciseToWorkoutDay();
  const updateExerciseMutation = useUpdateWorkoutExercise();
  const removeExerciseMutation = useRemoveExerciseFromWorkoutDay();

  const [isAddingDay, setIsAddingDay] = useState(false);
  const [newDayNumber, setNewDayNumber] = useState(workoutDays.length + 1); // Initialize with next logical day number
  const [newDayNotes, setNewDayNotes] = useState("");
  const [editingDayNotes, setEditingDayNotes] = useState<{ id: number; notes: string } | null>(null);

  const [isAddingExerciseToDay, setIsAddingExerciseToDay] = useState<number | null>(null); // dayId
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [exerciseSets, setExerciseSets] = useState(3);
  const [exerciseReps, setExerciseReps] = useState("8-12");
  const [exerciseRestTime, setExerciseRestTime] = useState(60);
  const [exerciseOrder, setExerciseOrder] = useState(1);

  const [editingExercise, setEditingExercise] = useState<{ dayId: number, exerciseId: number, currentExercise: WorkoutExerciseRequest } | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form fields when modal opens/workoutPlan changes
      setName(workoutPlan.name);
      setDescription(workoutPlan.description || "");
      setDifficulty(workoutPlan.difficulty);
      setWorkoutDays(workoutPlan.workoutDays.sort((a, b) => a.dayNumber - b.dayNumber));
      setNewDayNumber(workoutDays.length + 1); // Also update here if modal reopens
      
      // Fetch all exercises for selection
      const loadExercises = async () => {
        try {
          const exercises = await fetchAllExercises();
          setAvailableExercises(exercises);
        } catch (err) {
          console.error("Failed to fetch exercises:", err);
        }
      };
      loadExercises();
    }
  }, [isOpen, workoutPlan]);

  const handleSavePlan = async () => {
    try {
      const payload: WorkoutPlanRequest = {
        name,
        description,
        difficulty,
        isActive: workoutPlan.isActive,
        createdByTrainerId: workoutPlan.createdByTrainerId,
      };
      await updateWorkoutPlanMutation.mutateAsync({ id: workoutPlan.id, payload });
      alert("Workout plan updated successfully!");
      onClose();
    } catch (err: any) {
      alert(`Failed to update plan: ${err.message}`);
    }
  };

  // --- Workout Day Handlers ---
  const handleAddDay = async () => {
    if (!newDayNumber) {
      alert("Day number is required.");
      return;
    }
    try {
      const payload: WorkoutDayRequest = {
        dayNumber: newDayNumber,
        notes: newDayNotes,
        workoutExercises: [],
      };
      const newDay = await addWorkoutDayMutation.mutateAsync({ planId: workoutPlan.id, payload });
      setWorkoutDays([...workoutDays, newDay].sort((a, b) => a.dayNumber - b.dayNumber));
      setIsAddingDay(false);
      setNewDayNumber(workoutDays.length + 2); // Suggest next day number
      setNewDayNotes("");
    } catch (err: any) {
      alert(`Failed to add day: ${err.message}`);
    }
  };

  const handleDeleteDay = async (dayId: number) => {
    if (window.confirm("Are you sure you want to delete this workout day and all its exercises?")) {
      try {
        await deleteWorkoutDayMutation.mutateAsync({ planId: workoutPlan.id, dayId });
        setWorkoutDays(workoutDays.filter(day => day.id !== dayId));
      } catch (err: any) {
        alert(`Failed to delete day: ${err.message}`);
      }
    }
  };

  const handleUpdateDayNotes = async (dayId: number, notes: string) => {
    const dayToUpdate = workoutDays.find(day => day.id === dayId);
    if (!dayToUpdate) return;

    try {
      const payload: WorkoutDayRequest = {
        dayNumber: dayToUpdate.dayNumber,
        notes: notes,
        workoutExercises: dayToUpdate.workoutExercises.map(ex => ({
          exerciseId: ex.exercise.id,
          sets: ex.sets,
          reps: ex.reps,
          restTimeInSeconds: ex.restTimeInSeconds,
          orderInDay: ex.orderInDay,
        })),
      };
      const updatedDay = await updateWorkoutDayMutation.mutateAsync({ planId: workoutPlan.id, dayId, payload });
      setWorkoutDays(workoutDays.map(day => day.id === dayId ? updatedDay : day));
      setEditingDayNotes(null);
      alert("Day notes updated successfully!");
    } catch (err: any) {
      alert(`Failed to update day notes: ${err.message}`);
    }
  };

  // --- Workout Exercise Handlers ---
  const handleAddExercise = async (dayId: number) => {
    if (!selectedExerciseId) {
      alert("Please select an exercise.");
      return;
    }
    try {
      const payload: WorkoutExerciseRequest = {
        exerciseId: selectedExerciseId,
        sets: exerciseSets,
        reps: exerciseReps,
        restTimeInSeconds: exerciseRestTime,
        orderInDay: exerciseOrder,
      };
      const updatedDay = await addExerciseMutation.mutateAsync({ planId: workoutPlan.id, dayId, payload });
      setWorkoutDays(workoutDays.map(day => day.id === dayId ? updatedDay : day));
      setIsAddingExerciseToDay(null);
      setSelectedExerciseId(null);
      setExerciseSets(3);
      setExerciseReps("8-12");
      setExerciseRestTime(60);
      setExerciseOrder(1);
    } catch (err: any) {
      alert(`Failed to add exercise: ${err.message}`);
    }
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise || !selectedExerciseId) return;

    try {
      const payload: WorkoutExerciseRequest = {
        exerciseId: selectedExerciseId,
        sets: exerciseSets,
        reps: exerciseReps,
        restTimeInSeconds: exerciseRestTime,
        orderInDay: exerciseOrder,
      };
      const updatedDay = await updateExerciseMutation.mutateAsync({ 
        planId: workoutPlan.id, 
        dayId: editingExercise.dayId, 
        exerciseId: editingExercise.exerciseId, 
        payload 
      });
      setWorkoutDays(workoutDays.map(day => day.id === editingExercise.dayId ? updatedDay : day));
      setEditingExercise(null);
      setSelectedExerciseId(null);
      setExerciseSets(3);
      setExerciseReps("8-12");
      setExerciseRestTime(60);
      setExerciseOrder(1);
    } catch (err: any) {
      alert(`Failed to update exercise: ${err.message}`);
    }
  };

  const handleRemoveExercise = async (dayId: number, exerciseId: number) => {
    if (window.confirm("Are you sure you want to remove this exercise?")) {
      try {
        await removeExerciseMutation.mutateAsync({ planId: workoutPlan.id, dayId, exerciseId });
        setWorkoutDays(workoutDays.map(day => ({
            ...day,
            workoutExercises: day.workoutExercises.filter(ex => ex.id !== exerciseId)
        })));
      } catch (err: any) {
        alert(`Failed to remove exercise: ${err.message}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Edit Workout Plan: {workoutPlan.name}</h2>

        {/* Basic Plan Details */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">Plan Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="plan-name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input
                id="plan-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="plan-description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
              <textarea
                id="plan-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows={3}
              ></textarea>
            </div>
            <div>
              <label htmlFor="plan-difficulty" className="block text-gray-700 text-sm font-bold mb-2">Difficulty:</label>
              <select
                id="plan-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                {Object.values(Difficulty).map((diff) => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSavePlan}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={updateWorkoutPlanMutation.isPending}
          >
            {updateWorkoutPlanMutation.isPending ? "Saving..." : "Save Plan Details"}
          </button>
        </div>

        {/* Workout Days Section */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">Workout Days</h3>
          <div className="space-y-4">
            {workoutDays.map((day) => (
              <div key={day.id} className="border p-4 rounded-lg bg-white shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-lg">Day {day.dayNumber}</h4>
                  <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            // Set state to edit notes for this day
                            setEditingDayNotes({ id: day.id, notes: day.notes || "" });
                        }}
                        className="p-1 rounded-full hover:bg-yellow-100 text-yellow-600 transition-colors"
                        title="Edit Day Notes"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => setIsAddingExerciseToDay(day.id)}
                        className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                        title="Add Exercise"
                    >
                        <Plus size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDay(day.id)}
                      className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                      title="Delete Day"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {editingDayNotes?.id === day.id ? (
                    <div className="mb-2">
                        <textarea
                            value={editingDayNotes.notes}
                            onChange={(e) => setEditingDayNotes({ ...editingDayNotes, notes: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            rows={2}
                        ></textarea>
                        <div className="flex justify-end space-x-2 mt-2">
                            <button onClick={() => setEditingDayNotes(null)} className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-3 rounded">Cancel</button>
                            <button onClick={() => handleUpdateDayNotes(day.id, editingDayNotes.notes)} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">Save Notes</button>
                        </div>
                    </div>
                ) : (
                    day.notes && <p className="text-gray-600 mb-2 italic text-sm">Notes: {day.notes}</p>
                )}

                {/* Exercises for this day */}
                {day.workoutExercises.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {day.workoutExercises
                      .sort((a, b) => a.orderInDay - b.orderInDay)
                      .map((exercise) => (
                        <li key={exercise.id} className="text-gray-800 flex justify-between items-center">
                          <span>
                            <strong>{exercise.exercise.name}</strong>: {exercise.sets} sets of {exercise.reps} reps (Rest: {exercise.restTimeInSeconds || 0}s)
                          </span>
                          <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    setEditingExercise({
                                        dayId: day.id,
                                        exerciseId: exercise.id,
                                        currentExercise: {
                                            exerciseId: exercise.exercise.id,
                                            sets: exercise.sets,
                                            reps: exercise.reps,
                                            restTimeInSeconds: exercise.restTimeInSeconds,
                                            orderInDay: exercise.orderInDay,
                                        }
                                    });
                                    setSelectedExerciseId(exercise.exercise.id);
                                    setExerciseSets(exercise.sets);
                                    setExerciseReps(exercise.reps);
                                    setExerciseRestTime(exercise.restTimeInSeconds || 60);
                                    setExerciseOrder(exercise.orderInDay);
                                }}
                                className="p-1 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                                title="Edit Exercise"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleRemoveExercise(day.id, exercise.id)}
                              className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                              title="Remove Exercise"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-sm italic">No exercises for this day.</p>
                )}

                {/* Add Exercise Form */}
                {isAddingExerciseToDay === day.id && (
                  <div className="mt-4 p-3 border-t pt-4 space-y-3">
                    <h5 className="font-semibold mb-2">Add New Exercise</h5>
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">Exercise:</label>
                      <select
                        value={selectedExerciseId || ""}
                        onChange={(e) => setSelectedExerciseId(Number(e.target.value))}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                      >
                        <option value="">-- Select Exercise --</option>
                        {availableExercises.map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.name} ({ex.bodyPart})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Sets:</label>
                        <input type="number" value={exerciseSets} onChange={(e) => setExerciseSets(Number(e.target.value))} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Reps:</label>
                        <input type="text" value={exerciseReps} onChange={(e) => setExerciseReps(e.target.value)} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Rest Time (s):</label>
                        <input type="number" value={exerciseRestTime} onChange={(e) => setExerciseRestTime(Number(e.target.value))} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-1">Order in Day:</label>
                        <input type="number" value={exerciseOrder} onChange={(e) => setExerciseOrder(Number(e.target.value))} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => setIsAddingExerciseToDay(null)} className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-3 rounded">Cancel</button>
                      <button onClick={() => handleAddExercise(day.id)} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">Add Exercise</button>
                    </div>
                  </div>
                )}
                {/* Edit Exercise Form */}
                {editingExercise?.dayId === day.id && (
                    <div className="mt-4 p-3 border-t pt-4 space-y-3">
                        <h5 className="font-semibold mb-2">Edit Exercise</h5>
                        <div>
                            <label className="block text-gray-700 text-sm mb-1">Exercise:</label>
                            <select
                                value={selectedExerciseId || ""}
                                onChange={(e) => setSelectedExerciseId(Number(e.target.value))}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                            >
                                <option value="">-- Select Exercise --</option>
                                {availableExercises.map(ex => (
                                    <option key={ex.id} value={ex.id}>{ex.name} ({ex.bodyPart})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-gray-700 text-sm mb-1">Sets:</label>
                                <input type="number" value={exerciseSets} onChange={(e) => setExerciseSets(Number(e.target.value))} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm mb-1">Reps:</label>
                                <input type="text" value={exerciseReps} onChange={(e) => setExerciseReps(e.target.value)} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm mb-1">Rest Time (s):</label>
                                <input type="number" value={exerciseRestTime} onChange={(e) => setExerciseRestTime(Number(e.target.value))} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm mb-1">Order in Day:</label>
                                <input type="number" value={exerciseOrder} onChange={(e) => setExerciseOrder(Number(e.target.value))} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setEditingExercise(null)} className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-3 rounded">Cancel</button>
                            <button onClick={handleUpdateExercise} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">Save Changes</button>
                        </div>
                    </div>
                )}
              </div>
            ))}
            {/* Add New Day Form */}
            {isAddingDay ? (
              <div className="p-4 border-t pt-4 space-y-3">
                <h4 className="font-semibold mb-2">Add New Workout Day</h4>
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Day Number:</label>
                  <input type="number" value={newDayNumber} onChange={(e) => setNewDayNumber(Number(e.target.value))} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Notes (Optional):</label>
                  <textarea value={newDayNotes} onChange={(e) => setNewDayNotes(e.target.value)} className="shadow border rounded w-full py-2 px-3 text-gray-700" rows={2}></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setIsAddingDay(false)} className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-3 rounded">Cancel</button>
                  <button onClick={handleAddDay} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded">Add Day</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsAddingDay(true)} className="mt-4 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                <Plus size={20} /> Add New Day
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
