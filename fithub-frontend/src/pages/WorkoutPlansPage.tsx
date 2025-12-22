import React, { useState } from "react";
import { useAllWorkoutPlans, useWorkoutPlan, useDeleteWorkoutPlan } from "../hooks/useWorkoutPlans";
import { Difficulty } from "../types/Exercise";
import { type WorkoutPlan } from "../types/WorkoutPlan";
import { X, Edit, Trash2, UserPlus, Plus, Filter, Search, Activity, Users, Target, TrendingUp } from "lucide-react";
import { Button } from "../components/Button";
import { StatCard } from "../components/StatCard";
import PageHeader from "../components/PageHeader";
import EditWorkoutPlanModal from "../modals/EditWorkoutPlanModal";
import AssignToMemberModal from "../modals/AssignToMemberModal";
import AddWorkoutPlanModal from "../modals/AddWorkoutPlanModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { useProfile } from "../hooks/useProfile";

interface WorkoutPlansPageProps {
  userRole: "admin" | "trainer" | "member";
}

export default function WorkoutPlansPage({ userRole }: WorkoutPlansPageProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<WorkoutPlan | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [planToAssign, setPlanToAssign] = useState<WorkoutPlan | null>(null);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [planToDeleteId, setPlanToDeleteId] = useState<number | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const { data: workoutPlans, isLoading, error, refetch } = useAllWorkoutPlans(undefined, selectedDifficulty);
  const { data: detailedWorkoutPlan }: { data?: WorkoutPlan } = useWorkoutPlan(selectedPlanId as number);
  const { data: userProfile, isLoading: isLoadingProfile } = useProfile();

  const deleteWorkoutPlanMutation = useDeleteWorkoutPlan();

  // Filter plans by search term
  const filteredPlans = workoutPlans?.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plan.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  ) || [];

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.BEGINNER:
        return 'bg-green-50 border-green-200 text-green-800';
      case Difficulty.INTERMEDIATE:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case Difficulty.ADVANCED:
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getDifficultyBadgeColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.BEGINNER:
        return 'bg-green-500';
      case Difficulty.INTERMEDIATE:
        return 'bg-yellow-500';
      case Difficulty.ADVANCED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

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
      <div className="space-y-8">
        <PageHeader
          icon={Activity}
          title="Workout Plans"
          subtitle="Manage and assign workout plans for your gym members."
          actions={
            canManagePlans && (
              <Button onClick={() => setShowAddPlanModal(true)}>
                <Plus size={18} className="mr-2" /> Add Workout Plan
              </Button>
            )
          }
        />

        {/* STATS DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Plans"
            value={workoutPlans?.length || 0}
            icon={Activity}
            description="Available workout plans"
            variant="themedblue"
          />
          <StatCard
            title="Beginner Plans"
            value={workoutPlans?.filter(p => p.difficulty === Difficulty.BEGINNER).length || 0}
            icon={Target}
            description="Easy difficulty plans"
            variant="success"
          />
          <StatCard
            title="Intermediate Plans"
            value={workoutPlans?.filter(p => p.difficulty === Difficulty.INTERMEDIATE).length || 0}
            icon={Users}
            description="Medium difficulty plans"
            variant="warning"
          />
          <StatCard
            title="Advanced Plans"
            value={workoutPlans?.filter(p => p.difficulty === Difficulty.ADVANCED).length || 0}
            icon={TrendingUp}
            description="High intensity plans"
            variant="destructive"
          />
        </div>

        {/* FILTERS AND SEARCH */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search workout plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedDifficulty || "ALL"}
                onChange={handleDifficultyChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="ALL">All Difficulties</option>
                {Object.values(Difficulty).map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LOADING AND ERROR STATES */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading workout plans...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 text-lg font-medium mb-4">Error loading workout plans: {error.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* WORKOUT PLANS GRID */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 p-6 cursor-pointer ${getDifficultyColor(plan.difficulty)}`}
                onClick={() => handleCardClick(plan.id)}
              >
                {/* Difficulty Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getDifficultyBadgeColor(plan.difficulty)}`}>
                    {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Plan Icon */}
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <Activity size={20} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 pr-20">{plan.name}</h3>
                </div>

                {/* Plan Details */}
                <div className="space-y-3 mb-6">
                  <p className="text-gray-700 text-sm line-clamp-2">{plan.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Users size={16} className="text-gray-500" />
                      <span className="text-gray-600">{plan.workoutDays.length} days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target size={16} className="text-gray-500" />
                      <span className="text-gray-600">
                        {plan.workoutDays.reduce((acc, day) => acc + day.workoutExercises.length, 0)} exercises
                      </span>
                    </div>
                  </div>

                  {plan.createdByTrainerId && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Users size={16} className="text-gray-500" />
                      <span className="text-gray-500">Trainer ID: {plan.createdByTrainerId}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {canManagePlans && (
                  <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditPlan(plan); }}
                      className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                      title="Edit Plan"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                      className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAssignPlan(plan); }}
                      className="p-2 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                      title="Assign Plan"
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {filteredPlans.length === 0 && !isLoading && !error && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-3">
                  <Activity size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  {searchTerm || selectedDifficulty ? 'No workout plans match your filters' : 'No workout plans found'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || selectedDifficulty ? 'Try adjusting your search or filter' : 'Create your first workout plan to get started'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Workout Plan Details */}
      {selectedPlanId !== null && (
        <div className="fixed inset-0 flex justify-center items-center p-4 z-50 pointer-events-none">
          <div className="bg-blue-50 p-6 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative pointer-events-auto border border-blue-200">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-full p-2 shadow transition-colors duration-150 z-10"
                aria-label="Close"
              >
                <X size={22} />
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
