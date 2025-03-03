import { useForm } from "react-hook-form";
import { FaCheckCircle, FaPlus, FaTimes, FaCalendarAlt } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import PropTypes from 'prop-types';
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { 
  useCreateEventTaskMutation, 
  useGetEventTasksQuery,
  useUpdateTaskStatusMutation,
  useDeleteEventTaskMutation,
  useUpdateEventTaskMutation
} from "../../../redux/weddingPlanSlice";

const TaskForm = ({ eventId, eventTitle }) => {
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      task: "",
      priority: "Medium"
    }
  });

  // State for calendar modal
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // RTK Query hooks
  const { data: tasks = [], isLoading: tasksLoading, refetch } = useGetEventTasksQuery(eventId);
  const [createEventTask, { isLoading: isCreatingTask }] = useCreateEventTaskMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [deleteEventTask] = useDeleteEventTaskMutation();
  const [updateEventTask] = useUpdateEventTaskMutation();

  // Handle adding a new task
  const onSubmit = async (data) => {
    try {
      await createEventTask({
        data: {
          name: data.task,
          priority: data.priority,
          done: false,
          scheduleDate: null
        },
        eventId
      }).unwrap();
      
      // Reset form
      reset();
      
      // Refresh task list
      refetch();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  // Toggle task completion status
  const handleTaskStatus = async (taskId, currentStatus) => {
    try {
      await updateTaskStatus({
        taskId,
        status: !currentStatus
      }).unwrap();
      
      refetch();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation(); // Prevent toggling the task status
    
    try {
      await deleteEventTask(taskId).unwrap();
      refetch();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Update task schedule date
  const handleSetScheduleDate = async (date) => {
    if (selectedTaskIndex === null) return;
    
    const task = tasks[selectedTaskIndex];
    
    try {
      await updateEventTask({
        taskId: task.id,
        data: {
          ...task,
          scheduleDate: date ? date.toISOString() : null
        }
      }).unwrap();
      
      // Close calendar and refresh
      setShowCalendar(false);
      setSelectedTaskIndex(null);
      refetch();
    } catch (err) {
      console.error("Error updating task date:", err);
    }
  };

  // Open calendar for a specific task
  const openCalendar = (index, e) => {
    e.stopPropagation();
    setSelectedTaskIndex(index);
    setShowCalendar(true);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg border-4 border-pink-300">
      <h1 className="text-2xl font-semibold text-pink-600 mb-3">
        {eventTitle || "Event Tasks"}
      </h1>

      {/* Task form using React Hook Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
        <div className="mb-1 p-4 rounded-md relative group">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Task Name */}
            <div className="flex flex-col w-full">
              <p className="text-xs px-1">
                Task Name <span className="text-red-500">*</span>
              </p>
              <div className="flex items-center mt-1">
                <button 
                  type="submit" 
                  className="mr-2"
                  disabled={isCreatingTask}
                >
                  {isCreatingTask ? (
                    <Loader2 className="animate-spin text-pink-500" size={20} />
                  ) : (
                    <FaPlus className="text-pink-500 hover:text-pink-600" size={20} />
                  )}
                </button>
                <input
                  {...register("task", {
                    required: "Task name is required",
                    maxLength: {
                      value: 100,
                      message: "Task name cannot exceed 100 characters"
                    }
                  })}
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  type="text"
                  placeholder="Add a new task"
                />
              </div>
              {errors.task && (
                <span className="text-red-500 text-xs">
                  {errors.task.message}
                </span>
              )}
            </div>

            {/* Priority */}
            <div className="flex flex-col w-full">
              <p className="text-xs px-1">
                Priority <span className="text-red-500">*</span>
              </p>
              <select
                {...register("priority")}
                className="mt-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                defaultValue="Medium"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>
      </form>

      {/* Task List */}
      <div className="mt-4">
        <h4 className="text-lg font-medium text-gray-700 mb-2">Tasks</h4>
        
        {tasksLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin text-pink-500" size={24} />
            <span className="ml-2 text-gray-500">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 italic">No tasks yet. Add one above.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task, index) => (
              <li
                key={task.id}
                className={`flex items-center space-x-2 cursor-pointer group transition-all duration-300 ease-in-out ${
                  task.done ? "text-gray-400" : "text-gray-700"
                } ${
                  task.priority === "High" ? "border-l-4 border-red-400 pl-2" :
                  task.priority === "Medium" ? "border-l-4 border-yellow-400 pl-2" :
                  "border-l-4 border-green-400 pl-2"
                }`}
                onClick={() => handleTaskStatus(task.id, task.done)}
              >
                <FaCheckCircle
                  className={`transition-all duration-150 ${
                    task.done
                      ? "text-pink-500"
                      : "text-gray-300 group-hover:text-pink-400"
                  }`}
                  size={20}
                />

                <div className="flex-1 min-w-0">
                  <span
                    className={`leading-relaxed transition-all whitespace-normal block ${
                      task.done
                        ? "line-through opacity-50"
                        : "group-hover:text-pink-600"
                    }`}
                    style={{ wordBreak: "break-word" }}
                  >
                    {task.name}
                  </span>
                </div>

                {/* Task schedule date badge */}
                {task.scheduleDate && (
                  <span className="text-xs bg-pink-100 text-pink-800 rounded-full px-2 py-1">
                    {new Date(task.scheduleDate).toLocaleDateString()}
                  </span>
                )}

                {/* Action buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => openCalendar(index, e)}
                    className="text-gray-400 hover:text-pink-600"
                  >
                    <FaCalendarAlt size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteTask(task.id, e)}
                    className="text-gray-400 hover:text-pink-600"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Calendar Modal */}
      {showCalendar && selectedTaskIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={() => setShowCalendar(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-pink-600">Schedule Task</h2>
              <button onClick={() => setShowCalendar(false)} className="text-gray-400 hover:text-pink-600">
                <FaTimes size={20} />
              </button>
            </div>
            
            <h3 className="text-lg font-medium mb-3">{tasks[selectedTaskIndex]?.name}</h3>
            
            <Calendar
              onChange={(date) => handleSetScheduleDate(date)}
              value={tasks[selectedTaskIndex]?.scheduleDate ? new Date(tasks[selectedTaskIndex].scheduleDate) : null}
              className="w-full border rounded-lg p-2 mb-4"
            />
            
            <div className="flex justify-between">
              {tasks[selectedTaskIndex]?.scheduleDate && (
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md"
                  onClick={() => handleSetScheduleDate(null)}
                >
                  Remove Date
                </button>
              )}
              
              <button
                className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-6 rounded-md ml-auto"
                onClick={() => setShowCalendar(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

TaskForm.propTypes = {
  eventId: PropTypes.string.isRequired,
  eventTitle: PropTypes.string
};

TaskForm.defaultProps = {
  eventTitle: 'Event Tasks'
};

export default TaskForm;
