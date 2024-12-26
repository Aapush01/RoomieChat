# RoomieChat

RoomieChat is a real-time chat application built using the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO. Users can create and join chat rooms to communicate with each other seamlessly.

## Features

- **Real-Time Communication**: Instant messaging using Socket.IO for real-time updates.
- **Room-Based Chats**: Users can create rooms and join existing ones to chat.
- **Simple UI**: Clean and user-friendly interface built with React.
- **Scalable Backend**: Powered by Node.js and Express.js.

## Tech Stack

### Frontend
- React
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Real-Time Communication
- Socket.IO

## Installation and Setup

### Prerequisites

Ensure you have the following installed:
- Node.js
- npm or yarn
- MongoDB

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Aapush01/roomiechat.git
   cd roomiechat
   ```

2. Install dependencies:
   ```bash
   # For backend
   cd server
   yarn install

   # For frontend
   cd ../client
   yarn install
   ```

3. Start MongoDB:
   ```bash
   mongod
   ```

4. Configure environment variables:
   - Create a `.env` file in the `server` directory.
   - Add the following:
     ```env
     PORT=5000
     MONGO_URI=your_mongo_connection_string
     ```

5. Start the application:
   ```bash
   # Start backend
   cd server
   yarn start

   # Start frontend
   cd ../client
   yarn start
   ```

6. Access the application:
   Open your browser and navigate to `http://localhost:3000`.

## Usage

1. Create a room by entering a room name and clicking "Create Room."
2. Join an existing room by typing the room name and clicking "Join Room."
3. Start chatting in real-time with others in the room.

## Folder Structure

```
roomiechat/
├── client/       # Frontend code
├── server/       # Backend code
└── README.md     # Project documentation
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries, reach out to:
- **Name**: Muhammad Shahid
- **Email**: [mdshahidafridia31@gmail.com](mailto:mdshahidafridia31@gmail.com)
- **GitHub**: [Aapush01](https://github.com/Aapush01)
- **LinkedIn**: [MD. Shahid Afridi](https://www.linkedin.com/in/md-shahidafridi/)
