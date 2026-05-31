import { PrismaClient, Country, OrderStatus, PaymentStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password123!';

const users = [
  { name: 'Nick Fury', email: 'nick.fury@slooze.com', role: Role.ADMIN, country: Country.GLOBAL },
  { name: 'Captain Marvel', email: 'captain.marvel@slooze.com', role: Role.MANAGER, country: Country.INDIA },
  { name: 'Captain America', email: 'captain.america@slooze.com', role: Role.MANAGER, country: Country.AMERICA },
  { name: 'Thanos', email: 'thanos@slooze.com', role: Role.MEMBER, country: Country.INDIA },
  { name: 'Thor', email: 'thor@slooze.com', role: Role.MEMBER, country: Country.INDIA },
  { name: 'Travis', email: 'travis@slooze.com', role: Role.MEMBER, country: Country.AMERICA },
];

const restaurants = [
  {
    name: 'Spice Garden',
    description: 'Authentic Indian cuisine with bold spices and regional flavors.',
    country: Country.INDIA,
    menu: [
      { name: 'Butter Chicken', description: 'Creamy tomato curry with tender chicken', price: 14.99 },
      { name: 'Paneer Tikka', description: 'Grilled cottage cheese with mint chutney', price: 11.49 },
      { name: 'Biryani Rice', description: 'Fragrant basmati rice with saffron', price: 12.99 },
      { name: 'Masala Dosa', description: 'Crispy crepe filled with spiced potatoes', price: 9.99 },
      { name: 'Mango Lassi', description: 'Sweet yogurt drink with fresh mango', price: 4.49 },
    ],
  },
  {
    name: 'Mumbai Delights',
    description: 'Street food inspired dishes from the heart of Mumbai.',
    country: Country.INDIA,
    menu: [
      { name: 'Vada Pav', description: 'Spiced potato fritter in a soft bun', price: 6.99 },
      { name: 'Pav Bhaji', description: 'Mixed vegetable mash with buttered bread', price: 10.49 },
      { name: 'Pani Puri', description: 'Crispy shells with tangy tamarind water', price: 7.99 },
      { name: 'Chicken Frankie', description: 'Rolled flatbread wrap with spiced chicken', price: 11.99 },
      { name: 'Kulfi Falooda', description: 'Traditional ice cream dessert', price: 5.99 },
    ],
  },
  {
    name: 'Burger House',
    description: 'Classic American burgers and comfort food.',
    country: Country.AMERICA,
    menu: [
      { name: 'Classic Cheeseburger', description: 'Angus beef patty with cheddar', price: 13.99 },
      { name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce and crispy bacon', price: 15.49 },
      { name: 'Crispy Chicken Sandwich', description: 'Southern fried chicken on brioche', price: 12.99 },
      { name: 'Loaded Fries', description: 'Fries topped with cheese and jalapeños', price: 7.49 },
      { name: 'Chocolate Milkshake', description: 'Rich hand-spun chocolate shake', price: 5.99 },
    ],
  },
  {
    name: 'Texas Grill',
    description: 'Smoked meats and Texas-style barbecue.',
    country: Country.AMERICA,
    menu: [
      { name: 'Brisket Plate', description: 'Slow-smoked beef brisket with sides', price: 18.99 },
      { name: 'Pulled Pork Sandwich', description: 'Tender pork with coleslaw', price: 14.49 },
      { name: 'Ribs Half Rack', description: 'St. Louis style ribs with house rub', price: 19.99 },
      { name: 'Cornbread', description: 'Sweet honey butter cornbread', price: 4.99 },
      { name: 'Peach Cobbler', description: 'Warm peach dessert with vanilla ice cream', price: 6.99 },
    ],
  },
];

async function main() {
  console.log('Seeding database...');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers: Record<string, string> = {};
  for (const u of users) {
    const user = await prisma.user.create({
      data: { ...u, password: passwordHash },
    });
    createdUsers[u.email] = user.id;

    await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        cardHolder: u.name,
        cardNumberMasked: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: '12/28',
      },
    });
  }

  const menuItemIds: { id: string; country: Country; price: number }[] = [];

  for (const r of restaurants) {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: r.name,
        description: r.description,
        country: r.country,
      },
    });

    for (const m of r.menu) {
      const item = await prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          name: m.name,
          description: m.description,
          price: m.price,
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(m.name)}/400/300`,
        },
      });
      menuItemIds.push({ id: item.id, country: r.country, price: m.price });
    }
  }

  const thanosId = createdUsers['thanos@slooze.com'];
  const thorId = createdUsers['thor@slooze.com'];
  const travisId = createdUsers['travis@slooze.com'];

  const indiaItems = menuItemIds.filter((i) => i.country === Country.INDIA);
  const americaItems = menuItemIds.filter((i) => i.country === Country.AMERICA);

  const draftOrder = await prisma.order.create({
    data: {
      userId: thanosId,
      country: Country.INDIA,
      status: OrderStatus.DRAFT,
      totalAmount: 0,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: draftOrder.id,
      menuItemId: indiaItems[0].id,
      quantity: 2,
      price: indiaItems[0].price,
    },
  });

  await prisma.order.update({
    where: { id: draftOrder.id },
    data: { totalAmount: indiaItems[0].price * 2 },
  });

  const placedOrder = await prisma.order.create({
    data: {
      userId: thorId,
      country: Country.INDIA,
      status: OrderStatus.PLACED,
      totalAmount: indiaItems[1].price + indiaItems[2].price,
      items: {
        create: [
          { menuItemId: indiaItems[1].id, quantity: 1, price: indiaItems[1].price },
          { menuItemId: indiaItems[2].id, quantity: 1, price: indiaItems[2].price },
        ],
      },
    },
  });

  const paidOrder = await prisma.order.create({
    data: {
      userId: travisId,
      country: Country.AMERICA,
      status: OrderStatus.PAID,
      totalAmount: americaItems[0].price * 2,
      items: {
        create: [
          { menuItemId: americaItems[0].id, quantity: 2, price: americaItems[0].price },
        ],
      },
    },
  });

  const travisPm = await prisma.paymentMethod.findFirst({ where: { userId: travisId } });
  if (travisPm) {
    await prisma.payment.create({
      data: {
        orderId: paidOrder.id,
        paymentMethodId: travisPm.id,
        amount: paidOrder.totalAmount,
        status: PaymentStatus.SUCCESS,
      },
    });
  }

  await prisma.order.create({
    data: {
      userId: travisId,
      country: Country.AMERICA,
      status: OrderStatus.CANCELLED,
      totalAmount: americaItems[3].price,
      items: {
        create: [{ menuItemId: americaItems[3].id, quantity: 1, price: americaItems[3].price }],
      },
    },
  });

  console.log('Seed completed.');
  console.log(`Default password for all users: ${DEFAULT_PASSWORD}`);
  console.log('Sample order IDs:', { draftOrder: draftOrder.id, placedOrder: placedOrder.id, paidOrder: paidOrder.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
