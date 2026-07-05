# Trackent - Expense Tracker 🚀

Hi there! 👋 Welcome to **Trackent**, a personal expense tracking web application I built to help manage finances, track daily spending, and manage budgets efficiently. I developed this project to improve my skills in web development, database management, and building user-friendly interfaces.

## 🎯 What is the use of this app?
Managing money can be hard, especially for students like me! I built this app so that anyone can:
- **Track Daily Expenses:** Quickly log what you spend your money on.
- **Categorize Spending:** Sort your expenses (like food, travel, rent) to see where your money goes.
- **Manage Groups:** Share budgets or split expenses with friends or roommates.
- **Secure Dashboard:** Keep all your financial data private with a secure login system.

## 🛠️ Tools & Technologies Used
I learned and used some really cool modern tools to build this project:
- **React.js:** The main library used to build the user interface and components.
- **Vite:** A super-fast build tool that makes running and building the React app incredibly quick.
- **Tailwind CSS:** Used for styling the app to make it look sleek, modern, and responsive on all devices without having to write messy CSS files.
- **Supabase:** The backend database (a great alternative to Firebase). It handles all the secure user authentication (login/signup) and stores all the expense data safely in the cloud.
- **Lucide React:** For the beautiful icons you see throughout the application.

## 🚀 How to Run Locally

If you want to download and run my project on your own computer, follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/JontyDutta/Trackent-Expense-Tracker.git
   cd Trackent-Expense-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase Variables**
   Create a `.env` file in the root folder and add your Supabase keys:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

---
*Developed with ❤️ as a learning project.*
