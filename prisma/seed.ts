import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "miyaprim@gmail.com",
        phone: "+380981151137",
        password: await bcrypt.hash("password123", 10),
        name: "Марія Приймачук",
        birthDate: new Date("2005-10-10"),
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        email: "ivan.koval@gmail.com",
        phone: "+380501234567",
        password: await bcrypt.hash("password123", 10),
        name: "Іван Коваль",
        birthDate: new Date("2000-10-09"),
        role: "USER",
      },
    }),
    prisma.user.create({
      data: {
        email: "olena.petryk@gmail.com",
        phone: "+380631112233",
        password: await bcrypt.hash("password123", 10),
        name: "Олена Петрик",
        birthDate: new Date("1995-10-09"),
        role: "USER",
      },
    }),
    prisma.user.create({
      data: {
        email: "serhii.bondar@gmail.com",
        phone: "+380671234890",
        password: await bcrypt.hash("password123", 10),
        name: "Сергій Бондар",
        birthDate: new Date("1998-08-09"),
        role: "USER",
      },
    }),
    prisma.user.create({
      data: {
        email: "nastia.sladka@gmail.com",
        phone: "+380991234123",
        password: await bcrypt.hash("password123", 10),
        name: "Настя Сладка",
        birthDate: new Date("2003-10-09"),
        role: "USER",
      },
    }),
    prisma.user.create({
      data: {
        email: "dmytro.bondarenko@gmail.com",
        phone: "+380661234999",
        password: await bcrypt.hash("password123", 10),
        name: "Дмитро Бондаренко",
        birthDate: new Date("2025-10-09"),
        role: "USER",
      },
    }),
    prisma.user.create({
      data: {
        email: "oksana.levchuk@gmail.com",
        phone: "+380732228811",
        password: await bcrypt.hash("password123", 10),
        name: "Оксана Левчук",
        birthDate: new Date("2025-10-09"),
        role: "USER",
      },
    }),
    prisma.user.create({
      data: {
        email: "yurko.stepanovych@gmail.com",
        phone: "+380982225577",
        password: await bcrypt.hash("password123", 10),
        name: "Юрій Степанович",
        birthDate: new Date("2025-10-09"),
        role: "USER",
      },
    }),
    prisma.user.create({
      data: {
        email: "anna.bila@gmail.com",
        phone: "+380953337722",
        password: await bcrypt.hash("password123", 10),
        name: "Анна Біла",
        birthDate: new Date("2025-10-09"),
        role: "USER",
      },
    }),
  ]);

  // Create notification settings
  await Promise.all([
    prisma.notificationSettings.create({
      data: {
        userId: users[0].id,
        orderNotifications: true,
        promoNotifications: false,
        newsNotifications: false,
      },
    }),
    prisma.notificationSettings.create({
      data: {
        userId: users[8].id,
        orderNotifications: true,
        promoNotifications: true,
        newsNotifications: true,
      },
    }),
  ]);

  // Create addresses
  const addresses = await Promise.all([
    prisma.address.create({
      data: {
        userId: users[0].id,
        title: "Коледж",
        address: "Заводська, 23",
        city: "Ковель",
        postal: "00000",
        isDefault: true,
        fullName: "Марія Приймачук",
        phone: "+380981151137",
      },
    }),
    prisma.address.create({
      data: {
        userId: users[8].id,
        title: "ЛНТУ",
        address: "Львівська",
        city: "Луцьк",
        postal: "00000",
        isDefault: true,
        fullName: "Анна Біла",
        phone: "+380997153377",
      },
    }),
  ]);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        id: "c808534e-cc8c-4eaf-8027-60368f0bc012",
        name: "Стейки",
        slug: "steiky",
        description: "Ще не так давно якісні, смачні та соковиті стейки можна було скуштувати лише в ресторанах. Проте сьогодні можна замовити стейк з доставкою додому та приготувати його самостійно.",
      },
    }),
    prisma.category.create({
      data: {
        id: "44fff819-ff67-4662-8219-81fedbde1b77",
        name: "М'ясо для шашлику та барбекю",
        slug: "m-iaso-dlia-shashlyka-ta-barbekiu",
        description: "Шашлик та барбекю є надзвичайно популярними стравами для пікніка. Їх можна готувати навіть взимку, підсмажуючи на грилі або запікаючи в духовці.",
      },
    }),
    prisma.category.create({
      data: {
        id: "1c50c89b-5870-4b8d-b34d-6689b4aea372",
        name: "М'ясо птиці",
        slug: "m-iaso-ptytsi",
        description: "М'ясо птиці – це не тільки смачне, а й корисне м'ясо. Обирайте м'ясо птиці – курятину, м'ясо качки, гуски, індичатину, перепела, щоб спланувати різноманітне меню на тиждень.",
      },
    }),
    prisma.category.create({
      data: {
        id: "c1aee640-e4da-4938-ae7b-f0f7da02c612",
        name: "Свинина",
        slug: "svynyna",
        description: "Свинина – м'ясо, яке найчастіше вибирають для приготування найрізноманітніших страв як на домашніх, так і на професійних кухнях.",
      },
    }),
    prisma.category.create({
      data: {
        id: "addb0e81-84d3-44c4-8996-c3867ec6ead7",
        name: "Фарш",
        slug: "farsh",
        description: "Фарш – інгредієнт, без якого важко собі уявити котлетки, пельмені, чебуреки, смачнючі м'ясні пироги, голубці й безліч інших домашніх й ресторанних страв.",
      },
    }),
    prisma.category.create({
      data: {
        id: "2ebef381-735f-4ce2-b89e-67017575fe37",
        name: "Яловичина та телятина",
        slug: "yalovychyna-ta-teliatyna",
        description: "Яловичина і телятина – не тільки смачний, але й дуже корисний різновид м'яса. Його можна використовувати для тушкування, відварювання, запікання й смаження.",
      },
    }),
  ]);

  // Create products
  await Promise.all([
    prisma.product.create({
      data: {
        id: "20ded76d-83bc-4ac3-ae2a-7c1773138e0d",
        name: "Телячий стейк",
        categoryId: categories[0].id,
        description: "Телячий стейк",
        price: 207.1,
        sku: "0",
        status: "В наявності",
        stock: 15,
        ingredients: "Телятина",
      },
    }),
    prisma.product.create({
      data: {
        id: "bc69a0d0-4c95-4e66-995c-2d3ee718de7c",
        name: "Стейк «Рібай» Dry Aged",
        categoryId: categories[0].id,
        description: "Яловичина 100%",
        price: 787.05,
        sku: "3",
        status: "Закінчується",
        stock: 2,
        ingredients: "яловичина 100%",
      },
    }),
    prisma.product.create({
      data: {
        id: "f78add58-9e0e-4617-b117-fe3e65d21908",
        name: "Яловичий стейк охолоджений",
        categoryId: categories[0].id,
        description: "яловичина 100%",
        price: 215.85,
        sku: "4",
        status: "В наявності",
        stock: 10,
        ingredients: "яловичина 100%",
      },
    }),
    prisma.product.create({
      data: {
        id: "1ddb60d5-d7d6-4103-9c18-6942dace5855",
        name: "Яловичина молода Ekro Porterhouse Wet Aged охолоджена",
        categoryId: categories[0].id,
        description: "Яловичина 100%",
        price: 43.17,
        sku: "5",
        status: "В наявності",
        stock: 10,
        ingredients: "яловичина 100%",
      },
    }),
    prisma.product.create({
      data: {
        id: "bd89c6dc-57a9-42d3-bc1b-d5940eb62bf4",
        name: "Яловичий стейк/биток без кістки",
        categoryId: categories[0].id,
        description: "Яловичина 100%",
        price: 39.02,
        discount: 10,
        isOnSale: true,
        salePrice: 35.118,
        saleStartDate: "2025-06-15",
        saleEndDate: "2025-06-18",
        sku: "6",
        status: "В наявності",
        stock: 15,
        ingredients: "Яловичина 100%",
      },
    }),
    prisma.product.create({
      data: {
        id: "ce62ad4b-439b-4a38-936f-cda76973e41a",
        name: "Телятина молочна стейк T-bone Ekro, 100г",
        categoryId: categories[0].id,
        description: "Телятина",
        price: 85.9,
        sku: "7",
        status: "Закінчується",
        stock: 6,
        ingredients: "телятина 100%",
      },
    }),
    prisma.product.create({
      data: {
        id: "5247e0ff-a086-4afe-91a0-20b7fdb828a3",
        name: "Теляча гомілка Оссобуко",
        categoryId: categories[0].id,
        description: "Телятина 100%",
        price: 100.15,
        sku: "1",
        status: "В наявності",
        stock: 20,
        ingredients: "телятина 100%",
      },
    }),
    prisma.product.create({
      data: {
        id: "c5c600ed-9fe0-4429-95bc-e504a037024e",
        name: "Шашлик зі свинини Львівський напівфабрикат кулінарний в/у, 100г",
        categoryId: categories[1].id,
        description: "Тільки якісна свинина. Свинячий шашлик «Львівський» подобається всім, хто його куштує.",
        price: 22.4,
        discount: 16,
        isOnSale: true,
        salePrice: 18.816,
        saleStartDate: "2025-06-16",
        saleEndDate: "2025-06-21",
        sku: "8",
        status: "В наявності",
        stock: 35,
        ingredients: "свинина 95%, спеції 3%, приправа 1.8%, олія соняшникова 0.2%",
      },
    }),
    prisma.product.create({
      data: {
        id: "c293b5d9-dca0-4f93-a0d4-80220378c7fa",
        name: "Куряче стегно в маринаді, 100г",
        categoryId: categories[1].id,
        description: "Куряче стегно в маринаді",
        price: 18.9,
        sku: "11",
        status: "В наявності",
        stock: 31,
        ingredients: "Куряче стегно в маринаді",
      },
    }),
    prisma.product.create({
      data: {
        id: "55e36cfe-1fd5-4836-ab41-f3afd738019c",
        name: "Свинячий шашлик маринований, 100г",
        categoryId: categories[1].id,
        description: "Шашлик може бути простим. Маринований шашлик зі свинини зі спеціями майже готовий – м'ясце нарізане й замариноване.",
        price: 25.32,
        sku: "12",
        status: "Закінчується",
        stock: 12,
        ingredients: "свинина 95%, спеції 3%, приправа 1.8%, олія соняшникова 0.2%",
      },
    }),
    prisma.product.create({
      data: {
        id: "6a63b5b6-887f-4480-812b-f650a86d4421",
        name: "Свинячі реберця в маринаді Ла Барбекю охолоджені, 100г",
        categoryId: categories[1].id,
        description: "Свинячі реберця в маринаді",
        price: 24.9,
        sku: "13",
        status: "В наявності",
        stock: 23,
        ingredients: "свинячі ребра 94%, маринад 6%",
      },
    }),
    prisma.product.create({
      data: {
        id: "ee69a489-18be-4af8-baa9-264c9c3dd409",
        name: "Курячий бульнабор нижня частина сухої заморозки, 100г",
        categoryId: categories[2].id,
        description: "Курячий бульнабор нижня частина сухої заморозки",
        price: 2.49,
        sku: "369",
        status: "В наявності",
        stock: 32,
        ingredients: "Курячий бульнабор нижня частина сухої заморозки",
      },
    }),
    prisma.product.create({
      data: {
        id: "7e85f566-f704-4f46-ab99-14eb6a90441a",
        name: "Куряча гомілка в маринаді, 100г",
        categoryId: categories[1].id,
        description: "Соковита куряча гомілка в ароматному маринаді – ідеальний вибір для швидкого та смачного обіду чи вечері.",
        price: 13.4,
        sku: "14",
        status: "В наявності",
        stock: 19,
        ingredients: "Куряча гомілка (90%)",
      },
    }),
    prisma.product.create({
      data: {
        id: "f44be3bd-dcee-4279-836f-6fa315ff7bf8",
        name: "Шашлик з індички у сметанковому маринаді в/у, 100г",
        categoryId: categories[1].id,
        description: "Шашлик з індички у сметанковому маринаді",
        price: 32.4,
        sku: "15",
        status: "В наявності",
        stock: 17,
        ingredients: "індиче м'ясо стегна 85%, маринад 14%",
      },
    }),
    prisma.product.create({
      data: {
        id: "4d651f68-17ad-4029-bcec-5abe765e7fd8",
        name: "Гомілки курячі Снятинська птиця в апельсиновому маринаді",
        categoryId: categories[1].id,
        description: "Курячі гомілки від \"Снятинська птиця\" в апельсиновому маринаді – це вишуканий вибір для любителів соковитого м'яса з яскравим цитрусовим смаком.",
        price: 11.9,
        sku: "16",
        status: "В наявності",
        stock: 36,
        ingredients: "Куряча гомілка (88%) Маринад (Апельсиновий сік (1%), Вода питна, Олія соняшникова рафінована, Сіль кухонна, Цукор, Спеції та екстракти спецій)",
      },
    }),
    prisma.product.create({
      data: {
        id: "219b4565-bef8-4cf6-a161-aa66707f95db",
        name: "Індиче філе охолоджене, 100г",
        categoryId: categories[2].id,
        description: "Індиче філе 100%",
        price: 38.88,
        sku: "115",
        status: "В наявності",
        stock: 32,
        ingredients: "індиче філе 100%",
      },
    }),
    prisma.product.create({
      data: {
        id: "7aeb0d07-8612-40b2-87ec-30a8ac9ec26c",
        name: "Куряче стегно в маринаді, 100г",
        categoryId: categories[2].id,
        description: "Куряче стегно",
        price: 18.9,
        discount: 11,
        isOnSale: true,
        salePrice: 16.821,
        saleStartDate: "2025-06-07",
        saleEndDate: "2025-06-16",
        sku: "136",
        status: "В наявності",
        stock: 32,
        ingredients: "Куряче стегно",
      },
    }),
    prisma.product.create({
      data: {
        id: "0a5dafeb-56e8-4449-81d8-154a5118dcf8",
        name: "Качка пекінська свіжоморожена, 100г",
        categoryId: categories[2].id,
        description: "Качка пекінська свіжоморожена",
        price: 17.9,
        discount: 11,
        isOnSale: true,
        salePrice: 15.931,
        saleStartDate: "2025-06-07",
        saleEndDate: "2025-06-18",
        sku: "366",
        status: "В наявності",
        stock: 23,
        ingredients: "Качка пекінська",
      },
    }),
    prisma.product.create({
      data: {
        id: "eb9eb0f5-84af-4260-ae9c-c2b4a994b223",
        name: "Індиче стегно охолоджене, 100г",
        categoryId: categories[2].id,
        description: "Індиче стегно охолоджене",
        price: 25.99,
        sku: "367",
        status: "В наявності",
        stock: 56,
        ingredients: "Індиче стегно охолоджене",
      },
    }),
    prisma.product.create({
      data: {
        id: "bd08fadd-abb5-4ccc-a9ea-777400b9926e",
        name: "Куряче філе, 100г",
        categoryId: categories[2].id,
        description: "Куряче філе",
        price: 22.46,
        sku: "368",
        status: "В наявності",
        stock: 54,
        ingredients: "куряче філе",
      },
    }),
    prisma.product.create({
      data: {
        id: "0251761a-c01e-4dd5-b31d-f3e9b1a12fff",
        name: "Ковбаса «Домашня», 100г",
        categoryId: categories[3].id,
        description: "Соковита, ароматна і смачна – ковбаса домашня, зроблена за класичним рецептом, у якому лише найпростіше: свинина, спеції і часник.",
        price: 21.74,
        sku: "390",
        status: "В наявності",
        stock: 39,
        ingredients: "Невідомо",
      },
    }),
    prisma.product.create({
      data: {
        id: "8741fb77-00d2-4bb9-9030-57032229164d",
        name: "Фарш свинячий охолоджений ваговий, 100г",
        categoryId: categories[4].id,
        description: "свинина 100%",
        price: 19.4,
        sku: "391",
        status: "В наявності",
        stock: 254,
        ingredients: "свинина 100%",
      },
    }),
  ]);

  // Create carts
  await Promise.all([
    prisma.cart.create({
      data: {
        id: "dd122dd4-870c-467a-998f-26ad8a174e2a",
        userId: users[0].id,
      },
    }),
    prisma.cart.create({
      data: {
        id: "a6e80e3e-5b46-4e2c-a026-41a5e641fce6",
        userId: users[8].id,
      },
    }),
  ]);

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        status: "PENDING",
        total: 106.858,
        deliveryMethod: "nova-poshta",
        paymentId: "cash",
        addressId: addresses[0].id,
      },
    }),
    prisma.order.create({
      data: {
        userId: users[8].id,
        status: "PENDING",
        total: 105.22,
        deliveryMethod: "ukrposhta",
        paymentId: "cash",
        addressId: addresses[1].id,
      },
    }),
  ]);

  // Create order items
  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        name: "Ковбаса «Домашня», 100г",
        quantity: 1,
        price: 21.74,
        productId: "0251761a-c01e-4dd5-b31d-f3e9b1a12fff",
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        name: "Яловичий стейк/биток без кістки",
        quantity: 1,
        price: 39.02,
        productId: "bd89c6dc-57a9-42d3-bc1b-d5940eb62bf4",
      },
    }),
  ]);

  // Create slides
  await Promise.all([
    prisma.slide.create({
      data: {
        id: "a4e02705-a738-46ff-8ecd-7b1128c075e8",
        title: "Смак, що повертає в дитинство",
        subtitle: "Домашня ковбаска, духмяний джеркі та соковите м'ясо для шашлику — як у бабусі на свято!",
        image: "/uploads/1749299083456-640041333.png",
        link: "/catalog",
      },
    }),
    prisma.slide.create({
      data: {
        id: "b21dadc6-e438-484b-b75a-c66cc330fe5e",
        title: "Бабусині смаколики — зі смаком турботи",
        subtitle: "Обирай натуральне м'ясо без компромісів — від традиційних рецептів до сучасних делікатесів.",
        image: "/uploads/1749299221321-720186865.png",
        link: "/catalog",
      },
    }),
    prisma.slide.create({
      data: {
        id: "ca56b9ba-69cc-405f-ade3-d01fc9f02f11",
        title: "Все для ідеального пікніка",
        subtitle: "Готові м'ясні набори для грилю та шашлику — легко, швидко й дуже смачно!",
        image: "/uploads/1749299266526-991370450.png",
        link: "/catalog",
      },
    }),
    prisma.slide.create({
      data: {
        id: "7b72337e-18f6-490a-bd67-b3de45dbf448",
        title: "Кошик справжніх смаків",
        subtitle: "Ковбаси, джеркі, шашлики — усе, щоб здивувати гостей і потішити себе.",
        image: "/uploads/1749299381537-262596144.png",
        link: "/catalog",
      },
    }),
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
