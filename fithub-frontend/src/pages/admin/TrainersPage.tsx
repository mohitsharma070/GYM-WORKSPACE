import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dumbbell, Plus, Edit, Trash, Award, TrendingUp, Star } from 'lucide-react'; // Import the icons
import PageHeader from '../../components/PageHeader'; // Import PageHeader
import { Button } from '../../components/Button';

import type { Trainer } from "../../types/Trainer";
import type { PageResponse, SortDirection, UserSortBy } from "../../types/Page";
import {
  fetchTrainers,
  deleteTrainer,
  createTrainer,
  updateTrainer,
} from "../../api/trainers";

import AddTrainerModal from "../../modals/AddTrainerModal";
import EditTrainerModal from "../../modals/EditTrainerModal";

import Table from "../../components/Table";

export default function TrainersPage() {
  const queryClient = useQueryClient();

  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);

  /* NEW: Edit modal state */
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [showEditTrainerModal, setShowEditTrainerModal] = useState(false);

  /* SEARCH AND PAGINATION STATE */
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<UserSortBy>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  /* ------------------ QUERY: LOAD TRAINERS ------------------ */
  const trainersQuery = useQuery<PageResponse<Trainer>, Error>({
    queryKey: [
      "trainers",
      { page: currentPage, pageSize, sortBy, sortDir, searchTerm },
    ],
    queryFn: () =>
      fetchTrainers({
        page: currentPage - 1,
        size: pageSize,
        sortBy,
        sortDir,
        search: searchTerm || undefined,
      }),
  });

  const paginatedTrainers = trainersQuery.data?.content || [];
  const totalPages = trainersQuery.data?.totalPages || 0;
  const totalItems = trainersQuery.data?.totalElements || 0;

  /* ------------------ MUTATION: CREATE TRAINER ------------------ */
  const createTrainerMutation = useMutation({
    mutationFn: createTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
  });

  /* ------------------ MUTATION: DELETE TRAINER ------------------ */
  const deleteTrainerMutation = useMutation({
    mutationFn: deleteTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
  });

  /* ------------------ MUTATION: UPDATE TRAINER ------------------ */
  const updateTrainerMutation = useMutation({
    mutationFn: ({ id, data }: any) => updateTrainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
  });

  function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this trainer?")) return;
    deleteTrainerMutation.mutate(id);
  }

  async function handleAddTrainer(data: any) {
    await createTrainerMutation.mutateAsync(data);
    setShowAddTrainerModal(false);
  }

  async function handleUpdateTrainer(data: any) {
    if (!selectedTrainer) return;

    await updateTrainerMutation.mutateAsync({
      id: selectedTrainer.id,
      data,
    });

    setShowEditTrainerModal(false);
    setSelectedTrainer(null);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Dumbbell}
        title="Trainers"
        subtitle="Manage gym trainers and their specializations."
        actions={
          <Button
            onClick={() => setShowAddTrainerModal(true)}
            size="default"
          >
            <Plus size={18} className="mr-2" /> Add Trainer
          </Button>
        }
      />

      {/* STATS DASHBOARD REMOVED as per admin request */}

      {/* TABLE */}
      <div className="bg-yellow-100 shadow-sm rounded-lg p-6 border border-gray-100">
        {trainersQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading trainers...</p>
            </div>
          </div>
        ) : trainersQuery.error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">Failed to load trainers</div>
            <Button
              onClick={() => trainersQuery.refetch()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : paginatedTrainers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-3">
              <Dumbbell size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No trainers found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? 'Try adjusting your search terms' : 'Add trainers to get started'}
            </p>
          </div>
        ) : (
          <Table
            headers={["#", "Trainer Name", "Email Address", "Phone Number", "Specialization", "Actions", "Details"]}
            columnClasses={['w-1/12 text-center', 'w-2/12', 'w-3/12', 'w-2/12', 'w-2/12', 'w-2/12 text-center', 'w-1/12 text-center']}
            data={paginatedTrainers}
            renderCells={(trainer, index) => [
              <span className="text-gray-600 font-medium">{index + 1 + (currentPage - 1) * pageSize}</span>,
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Dumbbell size={16} className="text-blue-600" />
                </div>
                <span className="font-semibold text-gray-900">{trainer.name}</span>
              </div>,
              <span className="text-gray-700">{trainer.email}</span>,
              <span className="text-gray-600">{trainer.trainerDetails?.phone || 'Not provided'}</span>,
              <div className="text-sm">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Star size={12} className="mr-1" />
                  {trainer.trainerDetails?.specialization || 'General'}
                </span>
              </div>,
              <div className="flex gap-2 justify-center">
                {/* EDIT BUTTON */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrainer(trainer);
                    setShowEditTrainerModal(true);
                  }}
                >
                  <Edit size={14} className="mr-1" /> Edit
                </Button>

                {/* DELETE BUTTON */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(trainer.id);
                  }}
                >
                  <Trash size={14} className="mr-1" /> Delete
                </Button>
              </div>,
              <div className="text-center">
                <button className="text-green-600 hover:text-green-800 transition-colors">
                  <span className={`inline-block transform transition-transform duration-200 ${
                    openRowIndex === index ? "rotate-180" : ""
                  }`}>
                    ▼
                  </span>
                </button>
              </div>,
            ]}
            renderExpandedContent={(trainer) => (
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award size={20} className="mr-2 text-blue-600" />
                  Trainer Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star size={16} className="text-yellow-500" />
                      <p className="text-sm font-medium text-gray-500">Specialization</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">{trainer.trainerDetails?.specialization || 'General Training'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp size={16} className="text-green-500" />
                      <p className="text-sm font-medium text-gray-500">Experience</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {trainer.trainerDetails?.experienceYears ? `${trainer.trainerDetails.experienceYears} years` : 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award size={16} className="text-blue-500" />
                      <p className="text-sm font-medium text-gray-500">Certification</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">{trainer.trainerDetails?.certification || 'None specified'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-lg">{trainer.dateOfBirth || '—'}</p>
                  </div>
                </div>
              </div>
            )}
            keyExtractor={(trainer) => trainer.id}
            openRowIndex={openRowIndex}
            toggleRow={(index) =>
              setOpenRowIndex(openRowIndex === index ? null : index)
            }
            searchPlaceholder="Search trainers by name, email, or specialization..."
            searchTerm={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            totalItems={totalItems}
            sortableColumns={{ 0: "id", 1: "name", 2: "email" }}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={(column, direction) => {
              setSortBy(column as UserSortBy);
              setSortDir(direction);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* ADD TRAINER MODAL */}
      {showAddTrainerModal && (
        <AddTrainerModal
          onClose={() => setShowAddTrainerModal(false)}
          onSave={handleAddTrainer}
          creating={createTrainerMutation.isPending}
        />
      )}

      {/* EDIT TRAINER MODAL */}
      {showEditTrainerModal && selectedTrainer && (
        <EditTrainerModal
          trainer={selectedTrainer}
          show={showEditTrainerModal}
          onClose={() => setShowEditTrainerModal(false)}
          onUpdated={handleUpdateTrainer}
        />
      )}
    </div>
  );
}
