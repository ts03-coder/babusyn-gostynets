import { NextPage } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
    title: 'Про нас',
    description: 'Загальна інформація про ТМ "Бабусин гостинець"',
}

const About: NextPage = () => {
  return (
    <div>
        {/* Навігація */}
        <div className="py-3 px-4">
            <div className="container mx-auto">
            <div className="flex items-center text-sm text-gray-600">
                <Link href="/" className="hover:text-primary">
                Головна
                </Link>
                <span className="mx-2">/</span>
                <span>Про нас</span>
            </div>
            </div>
        </div>

        {/* Наша історія */}
        <section className="py-16 px-4 bg-white">
            <div className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                    <h1 className="text-3xl font-bold mb-6">Наша історія</h1>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Ми почали свій шлях у сфері м&apos;ясної продукції з бажання принести на стіл кожного українця справжній смак
                        якісного м&apos;яса. Заснована як сімейний бізнес, наша компанія протягом багатьох років вдосконалювала
                        рецептури та технології виробництва, не забуваючи про традиції.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Від самого початку ми керуємося ідеєю, що якісне м&apos;ясо – це основа для здорового харчування, а любов до
                        своєї справи – запорука успіху.
                    </p>
                    </div>
                    <div className="flex justify-center">
                    <Image
                        src="/images/our_history.jpg"
                        alt="Наша історія"
                        width={640}
                        height={640}
                        className="rounded-lg"
                    />
                    </div>
                </div>
            </div>
        </section>

        {/* Наші цінності */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 flex justify-center">
              <Image
                src="/images/our_values.jpg"
                alt="Наші цінності"
                width={640}
                height={640}
                className="rounded-lg"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">Наші цінності</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Наше головне завдання – гарантувати високу якість продукції, використовуючи тільки натуральні
                інгредієнти та суворий контроль на всіх етапах виробництва. Ми підтримуємо місцевих фермерів і обираємо
                постачальників, які дотримуються етичних стандартів вирощування тварин.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Наші пріоритети – екологічність, свіжість та відповідальне ставлення до довкілля. Ми прагнемо того, щоб
                кожен клієнт відчув різницю, обираючи наші продукти.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Чому обирають нас */}
      <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                  <h1 className="text-3xl font-bold mb-6">Чому обирають нас</h1>
                  <p className="text-gray-700 leading-relaxed mb-4">
                      Кожен шматок нашої продукції створений з думкою про вас. Ми пропонуємо широкий вибір м&apos;ясних виробів, які
                      відповідають найвищим стандартам якості та безпеки. Наші клієнти обирають нас за поєднання традиційних
                      смаків і сучасного підходу до виробництва.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                      Ми впевнені, що задоволений клієнт – це наш найбільший успіх, тому постійно вдосконалюємо наш сервіс та продукцію.
                  </p>
                  </div>
                  <div className="flex justify-center">
                  <Image
                      src="/images/why_choose_us.png"
                      alt="Чому обирають нас"
                      width={640}
                      height={640}
                      className="rounded-lg"
                  />
                  </div>
              </div>
          </div>
      </section>
    </div>
  )
}

export default About