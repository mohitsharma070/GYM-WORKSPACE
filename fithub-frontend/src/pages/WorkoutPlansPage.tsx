import React, { useState } from "react";
import { useAllWorkoutPlans, useWorkoutPlan, useDeleteWorkoutPlan } from "../hooks/useWorkoutPlans"; // useAssignWorkoutPlan will be called inside modal
import { Difficulty } from "../types/Exercise";
import Card from "../components/Card";
import { type WorkoutPlan } from "../types/WorkoutPlan"; // Import WorkoutPlan type
import { X, Edit, Trash2, UserPlus } from "lucide-react"; // For close button icon and new buttons
import EditWorkoutPlanModal from "../modals/EditWorkoutPlanModal";
import AssignToMemberModal from "../modals/AssignToMemberModal"; // Import the new assign modal
import AddWorkoutPlanModal from "../modals/AddWorkoutPlanModal"; // Import the AddWorkoutPlanModal
import ConfirmationModal from "../components/ConfirmationModal"; // Import the ConfirmationModal
import { useProfile } from "../hooks/useProfile"; // Import hook to get current user profile

interface WorkoutPlansPageProps {
  userRole: "admin" | "trainer" | "member";
}

export default function WorkoutPlansPage({ userRole }: WorkoutPlansPageProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | undefined>(undefined);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null); // State for selected plan ID
  const [showEditModal, setShowEditModal] = useState(false); // State to control edit modal visibility
  const [planToEdit, setPlanToEdit] = useState<WorkoutPlan | null>(null); // State to hold the plan being edited
  const [showAssignModal, setShowAssignModal] = useState(false); // State to control assign modal visibility
  const [planToAssign, setPlanToAssign] = useState<WorkoutPlan | null>(null); // State to hold the plan being assigned
  const [showAddPlanModal, setShowAddPlanModal] = useState(false); // State to control add plan modal visibility
  const [planToDeleteId, setPlanToDeleteId] = useState<number | null>(null); // State to hold the ID of the plan to be deleted
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false); // State to control delete confirmation modal visibility

  const { data: workoutPlans, isLoading, error, refetch } = useAllWorkoutPlans(undefined, selectedDifficulty); // Add refetch
  const { data: detailedWorkoutPlan }: { data?: WorkoutPlan } = useWorkoutPlan(selectedPlanId as number); // Fetch detailed plan when selectedPlanId is set
  const { data: userProfile, isLoading: isLoadingProfile } = useProfile(); // Get current user's profile

  const deleteWorkoutPlanMutation = useDeleteWorkoutPlan();

  const handleDifficultyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as Difficulty | "ALL";
    setSelectedDifficulty(value === "ALL" ? undefined : value);
    setSelectedPlanId(null); // Clear selected plan when difficulty changes
  };

  const handleCardClick = (planId: number) => {
    setSelectedPlanId(planId);
  };

  const handleCloseModal = () => {
    setSelectedPlanId(null);
  };

  const handleEditPlan = (plan: WorkoutPlan) => { // Receive full plan object
    setPlanToEdit(plan);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setPlanToEdit(null);
    refetch(); // Refetch plans after edit
  };

  const handleDeletePlan = (planId: number) => {
    setPlanToDeleteId(planId);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (planToDeleteId !== null) {
      try {
        await deleteWorkoutPlanMutation.mutateAsync(planToDeleteId);
        refetch(); // Refetch plans after successful deletion
        setShowDeleteConfirmModal(false);
        setPlanToDeleteId(null);
      } catch (error) {
        alert("Failed to delete workout plan.");
        console.error("Failed to delete workout plan:", error);
      }
    }
  };

  const handleAssignPlan = (plan: WorkoutPlan) => { // Receive full plan object
    if (!userProfile?.id) {
        alert("Cannot assign plan. User profile not loaded or ID is missing.");
        return;
    }
    // Assuming the authenticated user (trainer/admin) is the one assigning
    // For now, we'll use userProfile.id as currentTrainerId.
    // In a more robust system, you might have a separate trainerId field.
    if (userRole !== "admin" && userRole !== "trainer") {
        alert("Only trainers and admins can assign plans.");
        return;
    }
    setPlanToAssign(plan);
    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setPlanToAssign(null);
    // No need to refetch workout plans, as assignment doesn't change the list of available plans
  };

  const handleCloseAddPlanModal = () => {
    setShowAddPlanModal(false);
  };

  const canManagePlans = userRole === "admin" || userRole === "trainer";

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Workout Plans</h1>
        {canManagePlans && (
          <button
            onClick={() => setShowAddPlanModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            + Add Workout Plan
          </button>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="difficulty-select" className="block text-gray-700 text-sm font-bold mb-2">
          Filter by Difficulty:
        </label>
        <select
          id="difficulty-select"
          className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={selectedDifficulty || "ALL"}
          onChange={handleDifficultyChange}
        >
          <option value="ALL">All Difficulties</option>
          {Object.values(Difficulty).map((diff) => (
            <option key={diff} value={diff}>
              {diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p>Loading workout plans...</p>}
      {error && <p className="text-red-500">Error loading workout plans: {error.message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workoutPlans?.map((plan) => (
          <Card 
            key={plan.id} 
            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div onClick={() => handleCardClick(plan.id)} className="cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className={`px-3 py-1 rounded-full text-white ${
                    plan.difficulty === Difficulty.BEGINNER ? "bg-green-500" :
                    plan.difficulty === Difficulty.INTERMEDIATE ? "bg-yellow-500" :
                    "bg-red-500"
                }`}>
                  {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1).toLowerCase()}
                </span>
                {plan.createdByTrainerId && (
                  <span className="text-gray-500">Trainer ID: {plan.createdByTrainerId}</span>
                )}
              </div>
            </div>

            {canManagePlans && (
              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEditPlan(plan); }} // Pass the full plan object
                  className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                  title="Edit Plan"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                  className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                  title="Delete Plan"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAssignPlan(plan); }} // Pass full plan object
                  className="p-2 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                  title="Assign Plan"
                >
                  <UserPlus size={18} />
                </button>
              </div>
            )}
          </Card>
        ))}
        {workoutPlans?.length === 0 && !isLoading && !error && (
            <p className="text-gray-700">No workout plans found for the selected difficulty.</p>
        )}
      </div>

      {/* Modal for Workout Plan Details */}
      {selectedPlanId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={handleCloseModal} 
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            {detailedWorkoutPlan ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">{detailedWorkoutPlan.name}</h2>
                <p className="text-gray-700 mb-4">{detailedWorkoutPlan.description}</p>
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-white text-sm ${
                      detailedWorkoutPlan.difficulty === Difficulty.BEGINNER ? "bg-green-500" :
                      detailedWorkoutPlan.difficulty === Difficulty.INTERMEDIATE ? "bg-yellow-500" :
                      "bg-red-500"
                  }`}>
                    {detailedWorkoutPlan.difficulty.charAt(0).toUpperCase() + detailedWorkoutPlan.difficulty.slice(1).toLowerCase()}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-3">Workout Days</h3>
                {detailedWorkoutPlan.workoutDays.length > 0 ? (
                  <div className="space-y-4">
                    {detailedWorkoutPlan.workoutDays
                      .sort((a, b) => a.dayNumber - b.dayNumber)
                      .map((day) => (
                      <div key={day.id} className="border p-4 rounded-lg bg-gray-50">
                        <h4 className="font-bold text-lg mb-2">Day {day.dayNumber}</h4>
                        {day.notes && <p className="text-gray-600 mb-2 italic">{day.notes}</p>}
                        
                        {day.workoutExercises.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {day.workoutExercises
                              .sort((a, b) => a.orderInDay - b.orderInDay)
                              .map((exercise) => (
                                <li key={exercise.id} className="text-gray-800">
                                  <strong>{exercise.exercise.name}</strong>: {exercise.sets} sets of {exercise.reps} reps (Rest: {exercise.restTimeInSeconds || 0}s)
                                </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-600">No exercises planned for this day.</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No workout days planned for this plan.</p>
                )}
              </div>
            ) : (
              <p>Loading workout plan details...</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Workout Plan Modal */}
      {showEditModal && planToEdit && (
        <EditWorkoutPlanModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          workoutPlan={planToEdit}
        />
      )}

      {/* Assign to Member Modal */}
      {showAssignModal && planToAssign && userProfile?.id && !isLoadingProfile && (
        <AssignToMemberModal
          isOpen={showAssignModal}
          onClose={handleCloseAssignModal}
          workoutPlan={planToAssign}
          currentTrainerId={userProfile.id} // Pass the authenticated user's ID as the trainer ID
        />
      )}
      {showAssignModal && isLoadingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <p>Loading user profile...</p>
          </div>
        </div>
      )}

      {/* Add Workout Plan Modal */}
      {canManagePlans && (
        <AddWorkoutPlanModal
          isOpen={showAddPlanModal}
          onClose={handleCloseAddPlanModal}
          onPlanAdded={() => {
            refetch(); // Refetch plans after a new one is added
            handleCloseAddPlanModal();
          }}
        />
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => {
          setShowDeleteConfirmModal(false);
          setPlanToDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this workout plan? This action cannot be undone."
      />
    </>
  );
}
