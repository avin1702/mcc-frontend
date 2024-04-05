import React, { ChangeEvent, useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Navigate, useNavigate } from 'react-router-dom';

interface Employee {
  id: number;
  name: string;
  email: string;
}

interface Schedule {
  date: string;
  time: string;
  comment: string;
  email: string;
}

const EmployeePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmployee, setSelectedEmployee] = useState<number[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<string>('');
  const [selectedMinute, setSelectedMinute] = useState<string>('');
  const [isScheduleButtonEnabled, setIsScheduleButtonEnabled] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');
  const [remainingCharacters, setRemainingCharacters] = useState<number>(200);
  const [isCommentAdded, setIsCommentAdded] = useState<boolean>(false);
  let [scheduleArray, setScheduleArray] = useState<Schedule[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Access token not found');
        }

        const response = await fetch('http://localhost:3000/api/employees', {
          headers: {
            Authorization: `${accessToken}`,
          },
        });
        // console.log(response.status)
        if (!response.ok) {
            if (response.status === 401) {
                // If unauthorized (401), redirect to login page
                localStorage.removeItem('accessToken');
                return <Navigate to="/" />;
              }
              
          throw new Error('Failed to fetch employees');
        }

        const data = await response.json();
        setEmployees(data);
        setLoading(false);
      } catch (error) {
        navigate("/")
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  const handleCheckboxChange = (employeeId: number) => {
    const index = selectedEmployee.indexOf(employeeId);
    if (index === -1) {
      setSelectedEmployee([...selectedEmployee, employeeId]);
    } else {
      const updatedSelectedEmployee = [...selectedEmployee];
      updatedSelectedEmployee.splice(index, 1);
      setSelectedEmployee(updatedSelectedEmployee);
    }
    setShowScheduleForm(true);
  };

  const handleDateChange:any = (date: Date) => {
    setSelectedDate(date);
  };

  const handleHourChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedHour(e.target.value);
    checkScheduleButtonState(e.target.value, selectedMinute);
  };

  const handleMinuteChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMinute(e.target.value);
    checkScheduleButtonState(selectedHour, e.target.value);
  };

  const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setComment(text);
    setRemainingCharacters(200 - text.length);
    setIsCommentAdded(text.length > 0);
    checkScheduleButtonState(selectedHour, selectedMinute, text.length > 0);
  };

  const checkScheduleButtonState = (hour: string, minute: string, isCommentAdded: boolean = false) => {
    setIsScheduleButtonEnabled(hour !== '' && minute !== '' && isCommentAdded);
  };

  const today = new Date();
  const minSelectableDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const currentTime = today.getHours();

  const availableHours = Array.from({ length: 24 - currentTime }, (_, i) => currentTime + i);
  const availableMinutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : `${i}`));

  const handleSetSchedule = async () => {
    // Convert selectedDate to ISO string
    const dateString = selectedDate.toISOString().split('T')[0];
  
    // Create schedule objects for each selected employee
    const scheduleObjects: Schedule[] = [];
    selectedEmployee.forEach((employeeId) => {
      const employee = employees.find((employee) => employee.id === employeeId);
      if (employee) {
        const scheduleObject: Schedule = {
          date: dateString,
          time: `${selectedHour}:${selectedMinute}:00`,
          comment: comment || '', // Include the comment field with empty string if no comment is provided
          email: employee.email,
        };
        scheduleObjects.push(scheduleObject);
      }
    });
  
    // Add the schedule objects to the array using functional update
    scheduleArray = [...scheduleObjects];
    console.log(scheduleArray)
    // Reset form fields and state
    setSelectedEmployee([]);
    setSelectedHour('');
    setSelectedMinute('');
    setComment('');
    setIsScheduleButtonEnabled(false);
    // setShowScheduleForm(false);

    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('Access token not found');
        }
    
        const response = await fetch('http://localhost:3000/api/schedules', {
          method: 'POST',
          headers: {
            Authorization:`${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scheduleObjects),
        });
    
        if (!response.ok) {
        if (response.status === 401) {
                // If unauthorized (401), redirect to login page
                localStorage.removeItem('accessToken');
                return <Navigate to="/login" />;
              }
          
          throw new Error('Failed to set schedule');
        }
    
        console.log('Schedule set successfully!');
      } catch (error) {
        console.error('Error setting schedule:', error);
      }
  };

  const handleLogout = () => {
    // Clear access token from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Redirect to login page
    navigate("/")
  };
  

  return (
    <div className="p-6 flex">
      <div className="flex-grow">
        <h1 className="text-3xl font-semibold mb-4">Employee List</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul role="list" className="divide-y divide-gray-100">
            {employees.map((employee) => (
              <li key={employee.id} className="flex justify-between items-center gap-x-6 py-5">
                <div className="flex min-w-0 gap-x-4 items-center">
                  <input
                    type="checkbox"
                    id={`employee_${employee.id}`}
                    onChange={() => handleCheckboxChange(employee.id)}
                    checked={selectedEmployee.includes(employee.id)}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-gray-900">{employee.name}</p>
                    <p className="mt-1 truncate text-xs leading-5 text-gray-500">{employee.email}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showScheduleForm && (
        <div className="ml-6">
          <h2 className="text-2xl font-semibold mb-4">Schedule</h2>
          <div className="mb-4">
            <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700">
              Date:
            </label>
            <Calendar
            //   id="scheduleDate"
              onChange={handleDateChange}
              value={selectedDate}
              className="border-gray-200 rounded-lg shadow-md"
              minDate={minSelectableDate}
            />
          </div>
          <div className="flex space-x-4">
            <div>
              <label htmlFor="scheduleHour" className="block text-sm font-medium text-gray-700">
                Hour:
              </label>
              <select
                id="scheduleHour"
                name="scheduleHour"
                value={selectedHour}
                onChange={handleHourChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select hour</option>
                {availableHours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="scheduleMinute" className="block text-sm font-medium text-gray-700">
                Minute:
              </label>
              <select
                id="scheduleMinute"
                name="scheduleMinute"
                value={selectedMinute}
                onChange={handleMinuteChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select minute</option>
                {availableMinutes.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              Comment:
            </label>
            <textarea
              id="comment"
              name="comment"
              value={comment}
              onChange={handleCommentChange}
              maxLength={200}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            <p className="mt-2 text-sm text-gray-500">{remainingCharacters} characters remaining</p>
          </div>
          <button
            className={`mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md ${
              isScheduleButtonEnabled ? 'hover:bg-indigo-700' : 'cursor-not-allowed opacity-50'
            }`}
            onClick={handleSetSchedule}
            disabled={!isScheduleButtonEnabled}
          >
            Set Schedule
          </button>
        </div>
      )}
    <div>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md 'hover:bg-indigo-700' : 'cursor-not-allowed opacity-50'" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default EmployeePage;
