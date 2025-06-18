# Stay Finder

A full-stack property rental and booking application built with React, TypeScript, Node.js, and MongoDB.

## 🏗️ Project Structure

```
TheGlen/
├── client/          # React + TypeScript frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/          # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── routes/
│   └── package.json
└── README.md
```

## 🚀 Features

### Core Functionality
- **Property Management**: Browse, search, and manage rental properties
- **User Authentication**: Secure user registration and login
- **Booking System**: Complete booking workflow for properties
- **Review System**: Guest reviews with ratings (1-5 stars)
- **Review Moderation**: Admin capabilities for review approval/rejection

### Review System Features
- ⭐ Star ratings (1-5)
- 📝 Detailed comments (10-1000 characters)
- 🕒 24-hour edit window for reviews
- 🛡️ Review reporting and moderation
- 📊 Automatic property rating calculations
- 🔒 One review per booking restriction

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with custom properties (dark theme support)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi
- **Authentication**: JWT-based authentication

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Clone Repository
```bash
git clone <repository-url>
cd TheGlen
```

### Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stayfinder
JWT_SECRET=your-jwt-secret
```

Start the server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🔧 API Endpoints

### Review Endpoints
- `POST /api/reviews` - Create a new review
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id` - Update review (within 24 hours)
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/report` - Report a review
- `PUT /api/reviews/:id/moderate` - Moderate review (admin)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

## 📋 Models

### Review Model
```typescript
interface IReview {
  property: ObjectId;      // Reference to Property
  guest: ObjectId;         // Reference to User
  booking: ObjectId;       // Reference to Booking
  rating: number;          // 1-5 stars
  comment: string;         // Review text
  status: 'pending' | 'approved' | 'rejected';
  reports: Array<{
    reportedBy: ObjectId;
    reason: string;
    reportedAt: Date;
  }>;
  moderationNote?: string;
  moderatedBy?: ObjectId;
  moderatedAt?: Date;
}
```

## 🔐 Middleware

### Authentication
- JWT token validation
- User session management

### Validation
- Request body validation using Joi schemas
- Review creation/update validation
- Search parameter validation

## 🎨 Styling

The application uses a modern CSS approach with:
- CSS custom properties for theming
- Dark theme support
- Responsive design principles
- Sidebar layout with custom styling

## 🚦 Development

### Running in Development Mode

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
```

## 📝 Business Rules

### Review System
- Users can only review properties they have booked
- One review per booking
- Reviews can be edited within 24 hours of creation
- Reviews require moderation before being displayed
- Rating must be between 1-5 stars
- Comments must be 10-1000 characters

### Property Ratings
- Automatically calculated from approved reviews
- Updated whenever reviews are created, updated, or moderated

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Review editing is limited to 24 hours after creation
- Property rating updates are synchronous (consider async for better performance)

## 🔮 Future Enhancements

- Real-time notifications for review updates
- Advanced search filters
- Image upload for reviews
- Review analytics dashboard
- Email notifications for booking confirmations