import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '+1234567890' },
    update: {},
    create: {
      phone: '+1234567890',
      email: 'admin@moringa.com',
      name: 'Admin User',
      role: 'ADMIN',
      isVerified: true,
      password: adminPassword,
    },
  });

  console.log('👤 Created admin user:', admin.name);

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { phone: '+1234567891' },
    update: {},
    create: {
      phone: '+1234567891',
      email: 'customer@example.com',
      name: 'John Doe',
      role: 'CUSTOMER',
      isVerified: true,
      password: customerPassword,
    },
  });

  console.log('👤 Created customer user:', customer.name);

  // Create categories
  const breakfast = await prisma.category.upsert({
    where: { name: 'Breakfast' },
    update: {},
    create: {
      name: 'Breakfast',
      description: 'Start your day with our delicious breakfast options',
      image: '/images/categories/breakfast.jpg',
      order: 1,
    },
  });

  const lunch = await prisma.category.upsert({
    where: { name: 'Lunch' },
    update: {},
    create: {
      name: 'Lunch',
      description: 'Hearty meals for your midday appetite',
      image: '/images/categories/lunch.jpg',
      order: 2,
    },
  });

  const dinner = await prisma.category.upsert({
    where: { name: 'Dinner' },
    update: {},
    create: {
      name: 'Dinner',
      description: 'End your day with our satisfying dinner meals',
      image: '/images/categories/dinner.jpg',
      order: 3,
    },
  });

  const beverages = await prisma.category.upsert({
    where: { name: 'Beverages' },
    update: {},
    create: {
      name: 'Beverages',
      description: 'Refreshing drinks to complement your meal',
      image: '/images/categories/beverages.jpg',
      order: 4,
    },
  });

  console.log('📂 Created categories');

  // Create ingredients
  const ingredients = await Promise.all([
    prisma.ingredient.upsert({
      where: { name: 'Extra Cheese' },
      update: {},
      create: {
        name: 'Extra Cheese',
        description: 'Add more cheese to your meal',
        price: 2.50,
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Bacon' },
      update: {},
      create: {
        name: 'Bacon',
        description: 'Crispy bacon strips',
        price: 3.00,
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Avocado' },
      update: {},
      create: {
        name: 'Avocado',
        description: 'Fresh sliced avocado',
        price: 2.00,
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Mushrooms' },
      update: {},
      create: {
        name: 'Mushrooms',
        description: 'Sautéed mushrooms',
        price: 1.50,
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Lettuce' },
      update: {},
      create: {
        name: 'Lettuce',
        description: 'Fresh lettuce leaves',
        price: 0.50,
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Tomato' },
      update: {},
      create: {
        name: 'Tomato',
        description: 'Fresh tomato slices',
        price: 0.75,
      },
    }),
  ]);

  console.log('🥬 Created ingredients');

  // Create meals
  const pancakes = await prisma.meal.create({
    data: {
      name: 'Fluffy Pancakes',
      description: 'Stack of three fluffy pancakes served with maple syrup and butter',
      price: 12.99,
      image: '/images/meals/pancakes.jpg',
      categoryId: breakfast.id,
    },
  });

  const omelette = await prisma.meal.create({
    data: {
      name: 'Cheese Omelette',
      description: 'Three-egg omelette with your choice of fillings',
      price: 10.99,
      image: '/images/meals/omelette.jpg',
      categoryId: breakfast.id,
    },
  });

  const burger = await prisma.meal.create({
    data: {
      name: 'Classic Burger',
      description: 'Juicy beef patty with lettuce, tomato, and special sauce',
      price: 15.99,
      image: '/images/meals/burger.jpg',
      categoryId: lunch.id,
    },
  });

  const pasta = await prisma.meal.create({
    data: {
      name: 'Spaghetti Carbonara',
      description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
      price: 16.99,
      image: '/images/meals/pasta.jpg',
      categoryId: dinner.id,
    },
  });

  const coffee = await prisma.meal.create({
    data: {
      name: 'Artisan Coffee',
      description: 'Freshly brewed coffee from premium beans',
      price: 4.99,
      image: '/images/meals/coffee.jpg',
      categoryId: beverages.id,
    },
  });

  console.log('🍽️ Created meals');

  // Add ingredients to meals
  await prisma.mealIngredient.createMany({
    data: [
      // Omelette ingredients
      {
        mealId: omelette.id,
        ingredientId: ingredients[0].id, // Extra Cheese
        isOptional: true,
        isDefault: false,
      },
      {
        mealId: omelette.id,
        ingredientId: ingredients[1].id, // Bacon
        isOptional: true,
        isDefault: false,
      },
      {
        mealId: omelette.id,
        ingredientId: ingredients[3].id, // Mushrooms
        isOptional: true,
        isDefault: false,
      },
      // Burger ingredients
      {
        mealId: burger.id,
        ingredientId: ingredients[4].id, // Lettuce
        isOptional: false,
        isDefault: true,
      },
      {
        mealId: burger.id,
        ingredientId: ingredients[5].id, // Tomato
        isOptional: false,
        isDefault: true,
      },
      {
        mealId: burger.id,
        ingredientId: ingredients[0].id, // Extra Cheese
        isOptional: true,
        isDefault: false,
      },
      {
        mealId: burger.id,
        ingredientId: ingredients[1].id, // Bacon
        isOptional: true,
        isDefault: false,
      },
      {
        mealId: burger.id,
        ingredientId: ingredients[2].id, // Avocado
        isOptional: true,
        isDefault: false,
      },
    ],
  });

  console.log('🔗 Added ingredients to meals');

  // Create a sample order
  const sampleOrder = await prisma.order.create({
    data: {
      userId: customer.id,
      totalAmount: 28.98,
      orderType: 'DELIVERY',
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      phoneNumber: customer.phone,
      deliveryAddress: '123 Main St, City, State 12345',
      specialInstructions: 'Please ring the doorbell',
      status: 'PREPARING',
      items: {
        create: [
          {
            mealId: burger.id,
            quantity: 1,
            price: 15.99,
            selectedIngredients: {
              create: [
                { ingredientId: ingredients[0].id }, // Extra Cheese
                { ingredientId: ingredients[1].id }, // Bacon
              ],
            },
          },
          {
            mealId: coffee.id,
            quantity: 2,
            price: 4.99,
          },
        ],
      },
    },
  });

  console.log('📦 Created sample order');

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });