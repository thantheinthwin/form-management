## **Task: Form Management System**

### **Objective**

Develop a full-stack web application where:

* **Admin** can create, edit, delete forms with questions, assign them to users(for now, you can create only 1 admin and 1 user), track progress, and download reports in CSV, Excel, or PDF formats.  
* **Users** can view assigned forms, answer questions, and submit responses.

---

### **Tech Stack Requirements**

* **Frontend:** React or Next.js, Tailwind CSS  
* **Backend:** Node.js with Express.js  
* **Database:** MySQL  
* **Authentication:** JWT-based authentication

---

### **Features & Requirements**

#### **1\. Admin Panel**

* Login authentication  
* Create a new form with multiple questions  
  * Questions can be of type: text, multiple-choice, checkbox, etc.  
* Edit and delete existing forms  
* Assign forms to users  
* Track progress (how many users have completed the form)  
* Download reports in CSV, Excel, or PDF format

#### **2\. User Panel**

* Login authentication  
* View assigned forms  
* Fill and submit answers  
* See submission confirmation

#### **3\. Report & Progress Tracking**

* Admin should be able to track the status of each assigned form  
* Generate reports in CSV, Excel, or PDF format

---

### **Bonus (Optional)**

* Role-based access (Admin/User)  
* Dashboard for admin showing stats (e.g., number of forms, pending vs completed submissions)  
* Notifications for users when a form is assigned

---

### **Submission Guidelines**

* Push the code to a GitHub repository and share the link  
* Provide setup instructions in a `README.md` file

