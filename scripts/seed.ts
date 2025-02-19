require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Seed data for users and posts
const users = [
  { name: 'Dogan', email: 'lazutlivera@gmail.com', password: "kindred" },
  { name: 'Mustafa', email: 'demirci.mustafataha@gmail.com', password: "kindred" },
  { name: 'Tibet', email: 'tibetozturk@example.com', password: "kindred" },
];

const subscriptions = [
  { 
    user_id: 1, 
    service_name: "Netflix",
    price: 15.99,
    billing_cycle: "monthly",

  },
  { 
    user_id: 2, 
    service_name: "Spotify",
    price: 19.99,
    billing_cycle: "monthly",

  },
];

// Drop and recreate tables
async function resetDatabase() {
  try {

    await pool.query('DROP TABLE IF EXISTS subscriptions');
    await pool.query('DROP TABLE IF EXISTS users');
    

    // Recreate users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

     // Recreate subscriptions table
     await pool.query(`
      CREATE TABLE subscriptions (
        id SERIAL PRIMARY KEY, 
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        service_name VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        billing_cycle VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('Database reset complete!');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

// Seed users
async function seedUsers() {
  try {
    for (const user of users) {
      await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
        [user.name, user.email, user.password]
      );
    }
    console.log('Users table seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Seed subscriptions
async function seedSubscriptions() {
  try {
    for (const subscription of subscriptions) {
      await pool.query(
        'INSERT INTO subscriptions (user_id, service_name, price, billing_cycle) VALUES ($1, $2, $3, $4)',
        [subscription.user_id, subscription.service_name, subscription.price, subscription.billing_cycle]
      );
    }
    console.log('Subscriptions table seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Main seed function
async function seed() {
  try {
    await resetDatabase(); // Reset the database first
    await seedUsers();     // Seed users first
    await seedSubscriptions(); //Seed subscriptions
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    pool.end();  // Close the database connection
  }
}

// Run the seed function
seed();
