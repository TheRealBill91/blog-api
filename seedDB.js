const mongoose = require("mongoose");
const RegularUser = require("./models/regular_user");
const Post = require("./models/post");
const Comment = require("./models/comment");
const CommentUpvote = require("./models/comment_upvote");
const { DateTime } = require("luxon");
require("dotenv").config();

// MongoDB connection string
const dbUrl = process.env.MONGODB_DEV_URI;

mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DEV_DB_NAME,
  })
  .then(() => console.log("Database connected!"))
  .catch((error) => console.error("Connection failed!", error));

// Function to generate a password
function generatePassword() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

async function seedDB() {
  // Clear the database
  await Promise.all([
    RegularUser.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    CommentUpvote.deleteMany({}),
  ]);

  // Create users
  const users = [];
  for (let i = 0; i < 480; i++) {
    // Create enough users for max possible upvotes
    const user = await RegularUser.create({
      username: `user${i}`,
      email: `user${i}@example.com`,
      password: generatePassword(),
      source: "seedDB",
    });
    users.push(user);
  }

  // Create posts
  const posts = await Post.create([
    {
      title: "First Post",
      content:
        '<h2>Testing the blog entry</h2><p>Some more <a href="https://www.nvidia.com/en-us/glossary/data-science/large-language-models/" target="_blank" rel="noopener">text</a>.</p>',
      author: users[0]._id,
    },
    {
      title: "Second Post",
      content:
        '<h2>Testing the blog entry</h2><p>Some more <a href="https://www.nvidia.com/en-us/glossary/data-science/large-language-models/" target="_blank" rel="noopener">text</a>.</p>',
      author: users[1]._id,
    },
  ]);

  // Create comments and upvotes
  let userIndex = 2; // Start from the third user for comment upvotes
  for (const post of posts) {
    for (let i = 0; i < 30; i++) {
      const comment = await Comment.create({
        content: `This is comment ${i + 1} on post ${post.title}`,
        author: users[0]._id, // All comments are created by the first user
        timestamp: DateTime.now().toISO(),
        post: post._id,
      });

      // Create a random number of upvotes for each comment
      const numUpvotes = Math.floor(Math.random() * 15) + 2; // Random number between 2 and 16

      for (let j = 0; j < numUpvotes; j++) {
        await CommentUpvote.create({
          user: users[userIndex]._id,
          comment: comment._id,
          timestamp: new Date(),
        });
        userIndex++;
        if (userIndex >= users.length) {
          userIndex = 2; // Reset to third user if we've used all users
        }
      }
    }
  }

  console.log("Database seeded!");
}

seedDB().catch((error) => {
  console.error(error);
  mongoose.connection.close(); // Ensure DB connection is closed even if an error occurs
});
