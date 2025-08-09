// Central API base for all fetch calls.
<<<<<<< Current (Your changes)
export const API = import.meta.env.VITE_API_BASE || "http://localhost:10000";
=======
export const API = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "http://localhost:5001";
>>>>>>> Incoming (Background Agent changes)
