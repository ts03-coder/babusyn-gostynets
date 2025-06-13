--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg120+1)
-- Dumped by pg_dump version 17.2 (Debian 17.2-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: miya_admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO miya_admin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: miya_admin
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public."Address" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    title text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    postal text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL
);


ALTER TABLE public."Address" OWNER TO miya_admin;

--
-- Name: Address_id_seq; Type: SEQUENCE; Schema: public; Owner: miya_admin
--

CREATE SEQUENCE public."Address_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Address_id_seq" OWNER TO miya_admin;

--
-- Name: Address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miya_admin
--

ALTER SEQUENCE public."Address_id_seq" OWNED BY public."Address".id;


--
-- Name: Cart; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public."Cart" OWNER TO miya_admin;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO miya_admin;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO miya_admin;

--
-- Name: NotificationSettings; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public."NotificationSettings" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "orderNotifications" boolean DEFAULT true NOT NULL,
    "promoNotifications" boolean DEFAULT true NOT NULL,
    "newsNotifications" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."NotificationSettings" OWNER TO miya_admin;

--
-- Name: NotificationSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: miya_admin
--

CREATE SEQUENCE public."NotificationSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."NotificationSettings_id_seq" OWNER TO miya_admin;

--
-- Name: NotificationSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miya_admin
--

ALTER SEQUENCE public."NotificationSettings_id_seq" OWNED BY public."NotificationSettings".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    status text NOT NULL,
    total double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveryMethod" text,
    "paymentId" text,
    comment text,
    "addressId" integer
);


ALTER TABLE public."Order" OWNER TO miya_admin;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    name text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    "productId" text
);


ALTER TABLE public."OrderItem" OWNER TO miya_admin;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: miya_admin
--

CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OrderItem_id_seq" OWNER TO miya_admin;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miya_admin
--

ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;


--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: miya_admin
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Order_id_seq" OWNER TO miya_admin;

--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miya_admin
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: PaymentMethod; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public."PaymentMethod" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type text NOT NULL,
    last4 text NOT NULL,
    expiry text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."PaymentMethod" OWNER TO miya_admin;

--
-- Name: PaymentMethod_id_seq; Type: SEQUENCE; Schema: public; Owner: miya_admin
--

CREATE SEQUENCE public."PaymentMethod_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PaymentMethod_id_seq" OWNER TO miya_admin;

--
-- Name: PaymentMethod_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miya_admin
--

ALTER SEQUENCE public."PaymentMethod_id_seq" OWNED BY public."PaymentMethod".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text,
    discount integer DEFAULT 0 NOT NULL,
    image text,
    ingredients text,
    "isOnSale" boolean DEFAULT false NOT NULL,
    price double precision NOT NULL,
    "saleEndDate" text,
    "salePrice" double precision,
    "saleStartDate" text,
    sku text NOT NULL,
    status text NOT NULL,
    stock integer NOT NULL
);


ALTER TABLE public."Product" OWNER TO miya_admin;

--
-- Name: Slide; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public."Slide" (
    id text NOT NULL,
    title text NOT NULL,
    subtitle text NOT NULL,
    image text NOT NULL,
    link text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Slide" OWNER TO miya_admin;

--
-- Name: User; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text,
    phone text,
    password text NOT NULL,
    name text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "birthDate" timestamp(3) without time zone,
    role text DEFAULT 'USER'::text NOT NULL,
    "cartId" text,
    "notificationsId" integer
);


ALTER TABLE public."User" OWNER TO miya_admin;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: miya_admin
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO miya_admin;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: miya_admin
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: miya_admin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO miya_admin;

--
-- Name: Address id; Type: DEFAULT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Address" ALTER COLUMN id SET DEFAULT nextval('public."Address_id_seq"'::regclass);


--
-- Name: NotificationSettings id; Type: DEFAULT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."NotificationSettings" ALTER COLUMN id SET DEFAULT nextval('public."NotificationSettings_id_seq"'::regclass);


--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: OrderItem id; Type: DEFAULT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);


--
-- Name: PaymentMethod id; Type: DEFAULT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."PaymentMethod" ALTER COLUMN id SET DEFAULT nextval('public."PaymentMethod_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public."Address" (id, "userId", title, address, city, postal, "isDefault", "fullName", phone) FROM stdin;
1	1	Коледж	Заводська, 23	Ковель	00000	t	Марія Приймачук	+380981151137
2	9	ЛНТУ	Львівська	Луцьк	00000	t	Анна Біла	+380997153377
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public."Cart" (id, "userId") FROM stdin;
dd122dd4-870c-467a-998f-26ad8a174e2a	1
a6e80e3e-5b46-4e2c-a026-41a5e641fce6	9
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public."CartItem" (id, "cartId", "productId", quantity) FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public."Category" (id, name, slug, description, image, "createdAt", "updatedAt") FROM stdin;
c808534e-cc8c-4eaf-8027-60368f0bc012	Стейки	steiky	Ще не так давно якісні, смачні та соковиті стейки можна було скуштувати лише в ресторанах. Проте сьогодні можна замовити стейк з доставкою додому та приготувати його самостійно.	\N	2025-06-07 11:26:30.373	2025-06-07 11:26:30.373
44fff819-ff67-4662-8219-81fedbde1b77	 М'ясо для шашлику та барбекю	m-iaso-dlia-shashlyka-ta-barbekiu	Шашлик та барбекю є надзвичайно популярними стравами для пікніка. Їх можна готувати навіть взимку, підсмажуючи на грилі або запікаючи в духовці. Основа шашлику та барбекю – це мариноване м'ясо, яке готують потім на вугіллі. Смак шашлику залежить від рецепта маринаду. Але на смак шашлику та барбекю впливає також якість та тип м'яса. 	\N	2025-06-07 11:27:15.472	2025-06-07 11:27:15.472
1c50c89b-5870-4b8d-b34d-6689b4aea372	М'ясо птиці	m-iaso-ptytsi	М’ясо птиці – це не тільки смачне, а й корисне м’ясо. Обирайте м’ясо птиці – курятину, м’ясо качки, гуски, індичатину, перепела, щоб спланувати різноманітне меню на тиждень. Вся птиця має різний смак, та і вибрати можна і цілу птицю, і філе, і гомілки, і шматочки, і фарш з птиці.	\N	2025-06-07 11:28:00.448	2025-06-07 11:28:00.448
c1aee640-e4da-4938-ae7b-f0f7da02c612	Свинина	svynyna	Свинина – м'ясо, яке найчастіше вибирають для приготування найрізноманітніших страв як на домашніх, так і на професійних кухнях. Але далеко не завжди куплене на ринку чи в магазині м’ясо виявляється достатньо свіжим та якісним. Саме тому ми вирішили поділитися порадами, як купити якісну і свіжу свинину та вибрати найкращий продукт.	\N	2025-06-07 11:28:40.643	2025-06-07 11:28:40.643
addb0e81-84d3-44c4-8996-c3867ec6ead7	Фарш	farsh	Фарш – інгредієнт, без якого важко собі уявити котлетки, пельмені, чебуреки, смачнючі м’ясні пироги, голубці й безліч інших домашніх й ресторанних страв. Звісно, його можна приготувати самостійно, але для цього доведеться діставати м’ясорубку й витратити трішки часу – набагато швидше купити вже підготовлене м'ясо. Але чи буде воно дійсно якісним? Це дуже актуальне питання, адже склад перемеленого продукту визначити надзвичайно важко. Саме тому в нього може потрапити все що завгодно.	\N	2025-06-07 11:29:14.256	2025-06-07 11:29:14.256
2ebef381-735f-4ce2-b89e-67017575fe37	Яловичина та телятина	yalovychyna-ta-teliatyna	Яловичина і телятина – не тільки смачний, але й дуже корисний різновид м’яса. Його можна використовувати для тушкування, відварювання, запікання й смаження. Він ідеально підходить для шашликів, котлет, супів тощо. Але багато хто оминає цей продукт, віддаючи перевагу більш звичній свинині або курятині.	\N	2025-06-07 11:29:56.399	2025-06-07 11:29:56.399
\.


--
-- Data for Name: NotificationSettings; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public."NotificationSettings" (id, "userId", "orderNotifications", "promoNotifications", "newsNotifications") FROM stdin;
1	1	t	f	f
3	9	t	t	t
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public."Order" (id, "userId", status, total, "createdAt", "deliveryMethod", "paymentId", comment, "addressId") FROM stdin;
1	1	PENDING	106.858	2025-06-07 13:09:18.48	nova-poshta	cash		1
2	9	PENDING	105.22	2025-06-08 10:01:25.587	ukrposhta	cash		2
3	1	PENDING	85.118	2025-06-08 10:34:27.883	nova-poshta	cash		1
4	9	PENDING	81.862	2025-06-08 11:24:14.641	nova-poshta	cash		2
5	9	PENDING	136.65	2025-06-08 19:51:07.939	nova-poshta	cash		2
6	9	PENDING	83.64	2025-06-08 21:40:55.183	nova-poshta	cash		2
7	9	PENDING	83.64	2025-06-08 21:40:56.921	nova-poshta	cash		2
8	9	PENDING	83.64	2025-06-08 21:40:57.901	nova-poshta	cash		2
9	9	PENDING	83.64	2025-06-08 21:40:58.888	nova-poshta	cash		2
10	9	PENDING	83.64	2025-06-08 21:41:00.06	nova-poshta	cash		2
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public."OrderItem" (id, "orderId", name, quantity, price, "productId") FROM stdin;
1	1	Ковбаса «Домашня», 100г	1	21.74	0251761a-c01e-4dd5-b31d-f3e9b1a12fff
2	1	Яловичий стейк/биток без кістки	1	39.02	bd89c6dc-57a9-42d3-bc1b-d5940eb62bf4
3	2	Ковбаса «Домашня», 100г	3	21.74	0251761a-c01e-4dd5-b31d-f3e9b1a12fff
4	3	Яловичий стейк/биток без кістки	1	39.02	bd89c6dc-57a9-42d3-bc1b-d5940eb62bf4
5	4	Качка пекінська свіжоморожена, 100г	2	17.9	0a5dafeb-56e8-4449-81d8-154a5118dcf8
6	5	Яловичина молода Ekro Porterhouse Wet Aged охолоджена	1	43.17	1ddb60d5-d7d6-4103-9c18-6942dace5855
7	5	Ковбаса «Домашня», 100г	2	21.74	0251761a-c01e-4dd5-b31d-f3e9b1a12fff
8	6	Ковбаса «Домашня», 100г	1	21.74	0251761a-c01e-4dd5-b31d-f3e9b1a12fff
9	6	Гомілки курячі Снятинська птиця в апельсиновому маринаді	1	11.9	4d651f68-17ad-4029-bcec-5abe765e7fd8
10	7	Ковбаса «Домашня», 100г	1	21.74	0251761a-c01e-4dd5-b31d-f3e9b1a12fff
11	7	Гомілки курячі Снятинська птиця в апельсиновому маринаді	1	11.9	4d651f68-17ad-4029-bcec-5abe765e7fd8
12	8	Ковбаса «Домашня», 100г	1	21.74	0251761a-c01e-4dd5-b31d-f3e9b1a12fff
13	8	Гомілки курячі Снятинська птиця в апельсиновому маринаді	1	11.9	4d651f68-17ad-4029-bcec-5abe765e7fd8
14	9	Ковбаса «Домашня», 100г	1	21.74	0251761a-c01e-4dd5-b31d-f3e9b1a12fff
15	9	Гомілки курячі Снятинська птиця в апельсиновому маринаді	1	11.9	4d651f68-17ad-4029-bcec-5abe765e7fd8
16	10	Ковбаса «Домашня», 100г	1	21.74	0251761a-c01e-4dd5-b31d-f3e9b1a12fff
17	10	Гомілки курячі Снятинська птиця в апельсиновому маринаді	1	11.9	4d651f68-17ad-4029-bcec-5abe765e7fd8
\.


--
-- Data for Name: PaymentMethod; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public."PaymentMethod" (id, "userId", type, last4, expiry, "isDefault") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public."Product" (id, name, "categoryId", "createdAt", "updatedAt", description, discount, image, ingredients, "isOnSale", price, "saleEndDate", "salePrice", "saleStartDate", sku, status, stock) FROM stdin;
20ded76d-83bc-4ac3-ae2a-7c1773138e0d	Телячий стейк	c808534e-cc8c-4eaf-8027-60368f0bc012	2025-06-07 11:33:09.987	2025-06-07 11:33:09.987	Телячий стейк	0	/uploads/1749295989970-изображение_2025-06-07_143302676.png	Телятина	f	207.1	\N	207.1	\N	0	В наявності	15
bc69a0d0-4c95-4e66-995c-2d3ee718de7c	Стейк «Рібай» Dry Aged	c808534e-cc8c-4eaf-8027-60368f0bc012	2025-06-07 11:39:21.591	2025-06-07 11:39:21.591	Яловичина 100%	0	/uploads/1749296361573-изображение_2025-06-07_143907924.png	яловичина 100%	f	787.05	\N	787.05	\N	3	Закінчується	2
f78add58-9e0e-4617-b117-fe3e65d21908	Яловичий стейк охолоджений	c808534e-cc8c-4eaf-8027-60368f0bc012	2025-06-07 11:40:54.037	2025-06-07 11:40:54.037	яловичина 100%	0	/uploads/1749296453998-изображение_2025-06-07_144043241.png	яловичина 100%	f	215.85	\N	215.85	\N	4	В наявності	10
1ddb60d5-d7d6-4103-9c18-6942dace5855	Яловичина молода Ekro Porterhouse Wet Aged охолоджена	c808534e-cc8c-4eaf-8027-60368f0bc012	2025-06-07 11:42:15.788	2025-06-07 11:42:15.788	Яловичина 100%	0	/uploads/1749296535773-изображение_2025-06-07_144142830.png	яловичина 100%	f	43.17	\N	43.17	\N	5	В наявності	10
bd89c6dc-57a9-42d3-bc1b-d5940eb62bf4	Яловичий стейк/биток без кістки	c808534e-cc8c-4eaf-8027-60368f0bc012	2025-06-07 11:44:34.793	2025-06-07 11:44:34.793	Яловичина 100%	10	/uploads/1749296674781-изображение_2025-06-07_144312133.png	Яловичина 100%	t	39.02	2025-06-18	35.118	2025-06-15	6	В наявності	15
ce62ad4b-439b-4a38-936f-cda76973e41a	Телятина молочна стейк T-bone Ekro, 100г	c808534e-cc8c-4eaf-8027-60368f0bc012	2025-06-07 11:46:25.14	2025-06-07 11:46:25.14	Телятина 	0	\N	телятина 100%	f	85.9	\N	85.9	\N	7	Закінчується	6
5247e0ff-a086-4afe-91a0-20b7fdb828a3	Теляча гомілка Оссобуко	c808534e-cc8c-4eaf-8027-60368f0bc012	2025-06-07 11:36:54.458	2025-06-07 11:46:40.702	Телятина 100%	0	/uploads/1749296214446-изображение_2025-06-07_143635447.png	телятина 100%	f	100.15	\N	100.15	\N	1	В наявності	20
c5c600ed-9fe0-4429-95bc-e504a037024e	Шашлик зі свинини Львівський напівфабрикат кулінарний в/у, 100г	44fff819-ff67-4662-8219-81fedbde1b77	2025-06-07 11:50:26.479	2025-06-07 11:50:26.479	Тільки якісна свинина. Свинячий шашлик «Львівський» подобається всім, хто його куштує. Шашлик маринований в ароматних приправах: паприці, базиліку, часнику, мускатному горіхові. Особливого смаку в поєднанні зі спеціями дає сік вишні Морелло. Соковитий і ароматний – майже готовий, ідеальний для смаження на вогні або запікання в духовці.	16	/uploads/1749297026451-изображение_2025-06-07_144942315.png	свинина 95%, спеції 3%(цукор, сіль, спеції (паприка, петрушка, перець чорний мелений, базилік, часник, кориця, гвоздика, мускатний горіх, чилі), вишневий порошок (сік вишні Морелло, цукор), лимонна кислота Е330, загусник Е415, екстракт спецій (перець, паприка), аромат копчення), приправа 1,8%(регулятор кислотності Е331, крохмаль (картопляний), клітковина(псиліум), загусник Е 415); (регулятор кислотності (E 262, E 331), консервант E 223), олія соняшникова 0,2%	t	22.4	2025-06-21	18.816	2025-06-16	8	В наявності	35
c293b5d9-dca0-4f93-a0d4-80220378c7fa	Куряче стегно в маринаді, 100г	44fff819-ff67-4662-8219-81fedbde1b77	2025-06-07 11:52:47.677	2025-06-07 11:52:47.677	Куряче стегно в маринаді	0	/uploads/1749297167659-изображение_2025-06-07_145231959.png	Куряче стегно в маринаді	f	18.9	\N	18.9	\N	11	В наявності	31
55e36cfe-1fd5-4836-ab41-f3afd738019c	Свинячий шашлик маринований, 100г	44fff819-ff67-4662-8219-81fedbde1b77	2025-06-07 11:54:36.822	2025-06-07 11:54:36.822	Шашлик може бути простим. Маринований шашлик зі свинини зі спеціями майже готовий – м'ясце нарізане й замариноване. Вам не потрібно нічого вигадувати – просто викладаєте його на мангал і додаєте трошки овочів. Насолоджуйтеся соковитим смаком без зайвих клопотів.	0	/uploads/1749297276756-изображение_2025-06-07_145308750.png	свинина 95%, спеції 3%, приправа 1.8%, олія соняшникова 0.2%	f	25.32	\N	25.32	\N	12	Закінчується	12
6a63b5b6-887f-4480-812b-f650a86d4421	Свинячі реберця в маринаді Ла Барбекю охолоджені, 100г	44fff819-ff67-4662-8219-81fedbde1b77	2025-06-07 11:56:36.264	2025-06-07 11:56:36.264	Свинячі реберця в маринаді	0	/uploads/1749297396222-изображение_2025-06-07_145633187.png	свинячі ребра 94%, маринад 6% (олія ріпакова, прянощі (паприка, перець чорний мелений), сіль, олія оливкова, екстракт дріжджів, ароматизатори: м'яса, диму; сахароза, карамелізований цукор)	f	24.9	\N	24.9	\N	13	В наявності	23
ee69a489-18be-4af8-baa9-264c9c3dd409	Курячий бульнабор нижня частина сухої заморозки, 100г	1c50c89b-5870-4b8d-b34d-6689b4aea372	2025-06-07 12:36:30.312	2025-06-07 12:36:30.312	Курячий бульнабор нижня частина сухої заморозки	0	/uploads/1749299790294-изображение_2025-06-07_153603358.png	Курячий бульнабор нижня частина сухої заморозки	f	2.49	\N	2.49	\N	369	В наявності	32
7e85f566-f704-4f46-ab99-14eb6a90441a	Куряча гомілка в маринаді, 100г	44fff819-ff67-4662-8219-81fedbde1b77	2025-06-07 12:03:40.254	2025-06-07 12:03:40.254	Соковита куряча гомілка в ароматному маринаді – ідеальний вибір для швидкого та смачного обіду чи вечері. Завдяки ретельно підібраному маринаду з натуральних спецій і прянощів, м'ясо набуває насиченого смаку та ніжної текстури. Продукт охолоджений, готовий до приготування на грилі, в духовці чи на сковороді. Куряча гомілка в маринаді – це зручне рішення для тих, хто цінує якість і смак без зайвих зусиль.	0	/uploads/1749297820234-изображение_2025-06-07_150338194.png	Куряча гомілка (90%)	f	13.4	\N	13.4	\N	14	В наявності	19
f44be3bd-dcee-4279-836f-6fa315ff7bf8	Шашлик з індички у сметанковому маринаді в/у, 100г	44fff819-ff67-4662-8219-81fedbde1b77	2025-06-07 12:09:47.177	2025-06-07 12:09:47.177	Шашлик з індички у сметанковому маринаді	0	/uploads/1749298187092-image_product.png	індиче м'ясо стегна 85%, маринад 14% (вода, сіль, знежирений ЙОГУРТОВИЙ порошок, СИРОВАТКА порошок, цукор, прянощі (цибуля, часник, любисток), картопляний крохмаль, СМЕТАНА порошок 1.7%, трави (петрушка, кріп), загущувачі: Е412, Е415; регулятор кислотності Е262, натуральний ароматизатор (містить МОЛОКО)), функціональний препарат (регулятор кислотності Е331, крохмаль картопляний, клітковина (псиліум), загущувач Е415), функціональна добавка (регулятори кислотності: E262, E331; консервант E223 (натрію МЕТАБІСУЛЬФІТ))	f	32.4	\N	32.4	\N	15	В наявності	17
4d651f68-17ad-4029-bcec-5abe765e7fd8	Гомілки курячі Снятинська птиця в апельсиновому маринаді	44fff819-ff67-4662-8219-81fedbde1b77	2025-06-07 12:16:38.598	2025-06-07 12:16:38.598	Курячі гомілки від "Снятинська птиця" в апельсиновому маринаді – це вишуканий вибір для любителів соковитого м’яса з яскравим цитрусовим смаком. Апельсиновий маринад надає гомілкам ніжної текстури та освіжаючого аромату, ідеально поєднуючи солодкуваті нотки апельсину з ніжним курячим м’ясом. Продукт охолоджений, готовий до приготування: запікайте в духовці, смажте на грилі чи сковороді – страва завжди вийде смачною та апетитною. Підходить як для сімейної вечері, так і для святкового столу.	0	/uploads/1749298598549-image_product.png	Куряча гомілка (88%) Маринад (Апельсиновий сік (1%), Вода питна, Олія соняшникова рафінована, Сіль кухонна, Цукор, Спеції та екстракти спецій (паприка, куркума, чорний перець, імбир, гвоздика, кориця, лемонграс))	f	11.9	\N	11.9	\N	16	В наявності	36
219b4565-bef8-4cf6-a161-aa66707f95db	Індиче філе охолоджене, 100г	1c50c89b-5870-4b8d-b34d-6689b4aea372	2025-06-07 12:19:36.635	2025-06-07 12:19:36.635	Індиче філе 100%	0	/uploads/1749298776619-изображение_2025-06-07_151925816.png	індиче філе 100%	f	38.88	\N	38.88	\N	115	В наявності	32
7aeb0d07-8612-40b2-87ec-30a8ac9ec26c	Куряче стегно в маринаді, 100г	1c50c89b-5870-4b8d-b34d-6689b4aea372	2025-06-07 12:21:16.525	2025-06-07 12:21:16.525	Куряче стегно	11	/uploads/1749298876510-изображение_2025-06-07_152019861.png	Куряче стегно	t	18.9	2025-06-16	16.821	2025-06-07	136	В наявності	32
0a5dafeb-56e8-4449-81d8-154a5118dcf8	Качка пекінська свіжоморожена, 100г	1c50c89b-5870-4b8d-b34d-6689b4aea372	2025-06-07 12:22:38.027	2025-06-07 12:22:38.027	Качка пекінська свіжоморожена	11	/uploads/1749298957984-изображение_2025-06-07_152134548.png	Качка пекінська	t	17.9	2025-06-18	15.931	2025-06-07	366	В наявності	23
eb9eb0f5-84af-4260-ae9c-c2b4a994b223	Індиче стегно охолоджене, 100г	1c50c89b-5870-4b8d-b34d-6689b4aea372	2025-06-07 12:33:15.995	2025-06-07 12:33:15.995	Індиче стегно охолоджене	0	/uploads/1749299595943-изображение_2025-06-07_153312586.png	Індиче стегно охолоджене	f	25.99	\N	25.99	\N	367	В наявності	56
bd08fadd-abb5-4ccc-a9ea-777400b9926e	Куряче філе, 100г	1c50c89b-5870-4b8d-b34d-6689b4aea372	2025-06-07 12:34:42.691	2025-06-07 12:34:42.691	Куряче філе	0	/uploads/1749299682680-изображение_2025-06-07_153400022.png	куряче філе	f	22.46	\N	22.46	\N	368	В наявності	54
0251761a-c01e-4dd5-b31d-f3e9b1a12fff	Ковбаса «Домашня», 100г	c1aee640-e4da-4938-ae7b-f0f7da02c612	2025-06-07 12:41:21.489	2025-06-07 12:41:21.489	Соковита, ароматна і смачна – ковбаса домашня, зроблена за класичним рецептом, у якому лише найпростіше: свинина, спеції і часник. Готувати – суцільне задоволення. Її можна кинути на гриль, запекти в духовці або посмажити на пательні. А щоб ковбаска була соковитою всередині, додайте трошки води під час приготування. Щоб усім смакувало, подавайте її з гірчичним соусом чи хроном.	0	/uploads/1749300081475-изображение_2025-06-07_154043915.png	Невідомо	f	21.74	\N	21.74	\N	390	В наявності	39
8741fb77-00d2-4bb9-9030-57032229164d	Фарш свинячий охолоджений ваговий, 100г	addb0e81-84d3-44c4-8996-c3867ec6ead7	2025-06-07 12:42:30.961	2025-06-07 12:42:30.961	свинина 100%	0	/uploads/1749300150948-изображение_2025-06-07_154229565.png	свинина 100%	f	19.4	\N	19.4	\N	391	В наявності	254
\.


--
-- Data for Name: Slide; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public."Slide" (id, title, subtitle, image, link, "createdAt", "updatedAt") FROM stdin;
a4e02705-a738-46ff-8ecd-7b1128c075e8	Смак, що повертає в дитинство	Домашня ковбаска, духмяний джеркі та соковите м’ясо для шашлику — як у бабусі на свято!	/uploads/1749299083456-640041333.png	/catalog	2025-06-07 12:24:43.465	2025-06-07 12:24:43.465
b21dadc6-e438-484b-b75a-c66cc330fe5e	Бабусині смаколики — зі смаком турботи	Обирай натуральне м’ясо без компромісів — від традиційних рецептів до сучасних делікатесів.	/uploads/1749299221321-720186865.png	/catalog	2025-06-07 12:27:01.329	2025-06-07 12:27:01.329
ca56b9ba-69cc-405f-ade3-d01fc9f02f11	Все для ідеального пікніка	Готові м’ясні набори для грилю та шашлику — легко, швидко й дуже смачно!	/uploads/1749299266526-991370450.png	/catalog	2025-06-07 12:27:46.537	2025-06-07 12:27:46.537
7b72337e-18f6-490a-bd67-b3de45dbf448	Кошик справжніх смаків	Ковбаси, джеркі, шашлики — усе, щоб здивувати гостей і потішити себе.	/uploads/1749299381537-262596144.png	/catalog	2025-06-07 12:29:41.55	2025-06-07 12:29:41.55
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public."User" (id, email, phone, password, name, "createdAt", "birthDate", role, "cartId", "notificationsId") FROM stdin;
1	miyaprim@gmail.com	+380981151137	$2b$10$h7IuiQxuPqrhLY2VxRHnI.6amCoUfT2gvjEQR1/ORnVLtqrxwmljm	Марія Приймачук	2025-06-07 11:02:40.368	2005-10-10 20:00:00	ADMIN	\N	\N
2	ivan.koval@gmail.com	+380501234567	$2b$10$uAD9VyfpwF3419WiHEpo7.CvOD0wdU9dD1Z5bFXvEs6ix2fLIGGeq	Іван Коваль	2025-06-07 11:03:14.859	2000-10-09 21:00:00	USER	\N	\N
3	olena.petryk@gmail.com	\t+380631112233	$2b$10$pWNFW9hIsy0nCB72yggUz.RUxS0L1wNW.B/UymIvvzpkYvxs7PdhC	Олена Петрик	2025-06-07 11:03:36.51	1995-10-09 21:00:00	USER	\N	\N
4	serhii.bondar@gmail.com	+380671234890	$2b$10$Ynf5m1A/Fe4Jv6y5WBfo6uMS7Cs/MS2t.LB/zfl0ZZtESl6eAVI2i	Сергій Бондар	2025-06-07 11:04:02.905	1998-08-09 21:00:00	USER	\N	\N
5	nastia.sladka@gmail.com	+380991234123	$2b$10$SsSj3yMJfbA9krAXFUH/J.6mdhR3bxPWfK8eA.mnXHoiZxX3S9jmm	Настя Сладка	2025-06-07 11:04:27.593	2003-10-09 21:00:00	USER	\N	\N
6	dmytro.bondarenko@gmail.com	+380661234999	$2b$10$froQ76fXR4vKj4G.7RCd9OHgvl.2vNKDVmmw4Wa42tgrOeEERVeti	Дмитро Бондаренко	2025-06-07 11:04:51.113	2025-10-09 21:00:00	USER	\N	\N
7	oksana.levchuk@gmail.com	+380732228811	$2b$10$AqmtgLlNrlWmQ.XDg3PyT.ZbVyuIXprEGJsqrct1RpmZuQZz97gGC	Оксана Левчук	2025-06-07 11:05:16.411	2025-10-09 21:00:00	USER	\N	\N
8	yurko.stepanovych@gmail.com	+380982225577	$2b$10$mbFuj9pAjrfRtsrSN7e4VeVe2uGVADFf2DbKuKtWAe.einiIcfrma	Юрій Степанович	2025-06-07 11:06:07.735	2025-10-09 21:00:00	USER	\N	\N
9	anna.bila@gmail.com	+380953337722	$2b$10$fmY1BUXYcDVAD3a6.mOlSem7raXKMyA4o6pjIpMfFcs6XoywPAS0e	Анна Біла	2025-06-07 11:06:34.795	2025-10-09 21:00:00	USER	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: miya_admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d3dcb50e-6c64-48f1-8db1-29b12ad2cdd1	20f2cb48074a870763d959a158e86f30efbe85a49dda5ed43fef101874589650	2025-06-07 10:48:34.632904+00	20250428083051_init	\N	\N	2025-06-07 10:48:34.586836+00	1
549871cd-62db-46c8-8023-e36a41a01500	0a68e33d7973295fe4d4f0c60ee36057d644d280e7f0378cacebeb5f3fde200c	2025-06-07 10:48:34.961835+00	20250507101933_update_addresses_add_phone	\N	\N	2025-06-07 10:48:34.946949+00	1
217dc101-4357-4823-9815-b9803e591e7e	cd847a4487d5996dda763ec7cc1d851f29f1075e83b5df6e6af8ed802371853e	2025-06-07 10:48:34.658488+00	20250428092736_add_name_required	\N	\N	2025-06-07 10:48:34.638954+00	1
aa2b521a-0dd4-4c65-b550-0ce7c45128b0	9fb66c5fa060d1734d69e3f54440e85790cb967e1d1a60d979f7982935888177	2025-06-07 10:48:34.680386+00	20250428104602_add_birth_date	\N	\N	2025-06-07 10:48:34.664965+00	1
5ef7639e-3a86-46d1-9d2c-b91c29b53f83	023a07154942aad5cc276fd7395c9ae73f2af3e018b97e8ae260c9746e262e12	2025-06-07 10:48:34.740963+00	20250429073910_add_categories	\N	\N	2025-06-07 10:48:34.685721+00	1
ce7858c4-702c-4efe-bdce-227a174661cb	a4b800578681ea7fed0d6e1649beed5ca1a9caf4956cccd8b470047e5c0e320f	2025-06-07 10:48:34.981531+00	20250507102540_change_address_id_to_int	\N	\N	2025-06-07 10:48:34.966771+00	1
fd6f86ee-b51b-4aa4-98b9-cb0cb16dd933	07160af142556520a601f98dbceed4238854c206dc9782b6386eebf1ca96356c	2025-06-07 10:48:34.761889+00	20250429074317_add_role_to_user	\N	\N	2025-06-07 10:48:34.746794+00	1
e9d2890b-a45b-4632-8f3d-87cc38f1f737	61a7dadc4a553b5fe987fcf7b5a4006997517d1a2aa4cfa8f3d278f2fbefd36d	2025-06-07 10:48:34.785614+00	20250430092422_add_product_image	\N	\N	2025-06-07 10:48:34.767161+00	1
8fe04102-f6ee-4110-b0ec-ab964d95b6ca	89e7c654cd3dbb6b5b748316a9e7edad78b07141c79a39a0001b3f32c44ca0e1	2025-06-07 10:48:34.81067+00	20250501163345_add_slider_table	\N	\N	2025-06-07 10:48:34.791116+00	1
e60003dc-1551-43be-850c-a7396331be1c	cff729146d360d8245a0db2bb4a30764613b61f688831f9218c961ddad3040b7	2025-06-07 10:48:35.003276+00	20250513205758_update_order_address_relation	\N	\N	2025-06-07 10:48:34.986756+00	1
cd3aa462-6952-4ce3-84f2-59e60e7795cd	80a47e260fbbb4fd792920cb1f7faf82bc2a3f40bba8d573346b6c953cad2d02	2025-06-07 10:48:34.83743+00	20250501171757_add_cart	\N	\N	2025-06-07 10:48:34.815524+00	1
19b58f08-6529-4040-a4d6-2b0f44d55548	c39494e3bc9c1aad26b12cc1e5dcd07e654f013a136bf6bdae500e53c6653f84	2025-06-07 10:48:34.860806+00	20250501173404_add_cart_relation_to_user	\N	\N	2025-06-07 10:48:34.842882+00	1
1dcbb9e5-45b0-491f-8977-d0972d0a2722	f6847038d47d2dcd6c59a1bec25312bf270eae14af9bcf0e4e8a926bd6792127	2025-06-07 10:48:34.881415+00	20250507094514_add_product_id_to_order_item	\N	\N	2025-06-07 10:48:34.866315+00	1
f752f399-74f1-4fa5-9d4a-6d96c1b751b1	d921cf9d31b11e861d593f7dea0b065d993b6e1e6fd4eed679c7d82587f1d5f0	2025-06-07 10:48:35.027358+00	20250514072625_update_cartitem_model	\N	\N	2025-06-07 10:48:35.008435+00	1
1f2b6013-9c9a-450f-96b0-f4d8b1728455	127ccc5a48fff951d5faf100c7eb84e4a8fd0918a14019a34e8f7c7952b996f0	2025-06-07 10:48:34.90231+00	20250507095537_add_order_details	\N	\N	2025-06-07 10:48:34.887053+00	1
a7ff987a-2e72-4f74-9f78-8ae836c91966	760c0d02fbafda614abe31a3d33d5c3e3de851409aee31b7ef8813a7291fd8d2	2025-06-07 10:48:34.922153+00	20250507100348_add_product_id_to_order_item	\N	\N	2025-06-07 10:48:34.907183+00	1
cce0a656-34aa-43cf-a809-b71793e6c42f	1d68cb67b44fa656970dbda579b91ebdee115ee5cf4bd5bef2612a16e31c9459	2025-06-07 10:48:34.942246+00	20250507101644_update_addresses	\N	\N	2025-06-07 10:48:34.927062+00	1
\.


--
-- Name: Address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miya_admin
--

SELECT pg_catalog.setval('public."Address_id_seq"', 2, true);


--
-- Name: NotificationSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miya_admin
--

SELECT pg_catalog.setval('public."NotificationSettings_id_seq"', 4, true);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miya_admin
--

SELECT pg_catalog.setval('public."OrderItem_id_seq"', 17, true);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miya_admin
--

SELECT pg_catalog.setval('public."Order_id_seq"', 10, true);


--
-- Name: PaymentMethod_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miya_admin
--

SELECT pg_catalog.setval('public."PaymentMethod_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: miya_admin
--

SELECT pg_catalog.setval('public."User_id_seq"', 9, true);


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: NotificationSettings NotificationSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."NotificationSettings"
    ADD CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PaymentMethod PaymentMethod_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."PaymentMethod"
    ADD CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Slide Slide_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Slide"
    ADD CONSTRAINT "Slide_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: miya_admin
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: miya_admin
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: miya_admin
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: NotificationSettings_userId_key; Type: INDEX; Schema: public; Owner: miya_admin
--

CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON public."NotificationSettings" USING btree ("userId");


--
-- Name: Product_sku_key; Type: INDEX; Schema: public; Owner: miya_admin
--

CREATE UNIQUE INDEX "Product_sku_key" ON public."Product" USING btree (sku);


--
-- Name: User_cartId_key; Type: INDEX; Schema: public; Owner: miya_admin
--

CREATE UNIQUE INDEX "User_cartId_key" ON public."User" USING btree ("cartId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: miya_admin
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_notificationsId_key; Type: INDEX; Schema: public; Owner: miya_admin
--

CREATE UNIQUE INDEX "User_notificationsId_key" ON public."User" USING btree ("notificationsId");


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: miya_admin
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NotificationSettings NotificationSettings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."NotificationSettings"
    ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_addressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES public."Address"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PaymentMethod PaymentMethod_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."PaymentMethod"
    ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: miya_admin
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: miya_admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

