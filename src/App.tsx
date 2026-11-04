import { useState, useEffect } from 'react'

const capabilities = [
  {
    icon: '🎨',
    title: 'Создание веб-сайтов',
    description: 'Создаю полноценные сайты с React, Vite и Tailwind CSS — от лендингов до сложных SPA приложений.',
    color: 'from-blue-500 to-cyan-500',
    details: ['React компоненты', 'Адаптивный дизайн', 'Анимации CSS', 'Tailwind стилизация']
  },
  {
    icon: '📊',
    title: 'Дашборды и визуализация',
    description: 'Интерактивные дашборды, графики, диаграммы и панели управления данными.',
    color: 'from-purple-500 to-pink-500',
    details: ['Графики и чарты', 'Таблицы данных', 'Фильтрация', 'Экспорт данных']
  },
  {
    icon: '🛒',
    title: 'E-commerce решения',
    description: 'Интернет-магазины с каталогом товаров, корзиной и оформлением заказов.',
    color: 'from-green-500 to-emerald-500',
    details: ['Каталог товаров', 'Корзина покупок', 'Фильтры и поиск', 'Оформление заказа']
  },
  {
    icon: '🎮',
    title: 'Игры и интерактив',
    description: 'Браузерные игры, квизы, интерактивные головоломки и образовательные приложения.',
    color: 'from-orange-500 to-red-500',
    details: ['Canvas анимации', 'Игровая логика', 'Счёт и уровни', 'Мультимедиа']
  },
  {
    icon: '🔌',
    title: 'Интеграция API',
    description: 'Подключаю внешние API для получения данных, погоды, карт и других сервисов.',
    color: 'from-indigo-500 to-violet-500',
    details: ['REST API', 'Погода', 'Карты', 'Соцсети']
  },
  {
    icon: '📱',
    title: 'Мобильный дизайн',
    description: 'Полностью адаптивные сайты, которые отлично выглядят на любых устройствах.',
    color: 'from-teal-500 to-cyan-500',
    details: ['Mobile-first', 'Touch интерфейс', 'PWA поддержка', 'Адаптивная сетка']
  },
  {
    icon: '⚡',
    title: 'Оптимизация',
    description: 'Быстрая загрузка, SEO-оптимизация и лучшая производительность.',
    color: 'from-yellow-500 to-orange-500',
    details: ['Lazy loading', 'Code splitting', 'SEO мета-теги', 'Оптимизация изображений']
  },
  {
    icon: '🔍',
    title: 'Поиск информации',
    description: 'Могу искать актуальную информацию в интернете для вашего проекта.',
    color: 'from-rose-500 to-pink-500',
    details: ['Веб-поиск', 'Документация API', 'Актуальные данные', 'Исследование']
  }
]

const techStack = [
  { name: 'React', icon: '⚛️' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Tailwind CSS', icon: '🎨' },
  { name: 'Vite', icon: '⚡' },
  { name: 'HTML5', icon: '🌐' },
  { name: 'CSS3', icon: '✨' },
  { name: 'JavaScript', icon: '📜' },
  { name: 'Node.js', icon: '🟢' },
]

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return <span>{count}</span>
}

function TypingEffect({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayed(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, speed])

  return (
    <span>
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  )
}

function CapabilityCard({ capability, index }: { capability: typeof capabilities[0]; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${capability.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 h-full transition-all duration-300 group-hover:border-gray-600/80">
        <div className="text-4xl mb-4">{capability.icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{capability.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{capability.description}</p>
        
        <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-48 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-gray-700/50 pt-4">
            <ul className="space-y-2">
              {capability.details.map((detail, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${capability.color}`} />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 flex items-center text-xs text-gray-500">
          <span className="group-hover:text-gray-300 transition-colors">
            {isExpanded ? 'Нажмите, чтобы свернуть' : 'Нажмите для подробностей →'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      const sections = ['hero', 'capabilities', 'stats', 'tech']
      for (const section of sections.reverse()) {
        const el = document.getElementById(section)
        if (el && window.scrollY >= el.offsetTop - 200) {
          setActiveSection(section)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" 
          style={{ transform: `translateY(${scrollY * 0.2}px)` }} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * -0.15}px)` }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-sm font-bold">
              AI
            </div>
            <span className="font-bold text-lg">Web Developer</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['Возможности', 'Статистика', 'Технологии'].map((item, i) => (
              <a
                key={i}
                href={`#${['capabilities', 'stats', 'tech'][i]}`}
                className={`text-sm transition-colors hover:text-white ${
                  activeSection === ['capabilities', 'stats', 'tech'][i] ? 'text-white' : 'text-gray-400'
                }`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-full text-sm text-gray-300">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Готов создавать для вас
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Веб-Разработчик
            </span>
          </h1>
          
          <div className="text-xl md:text-2xl text-gray-300 mb-8 h-16">
            <TypingEffect text="Создаю современные веб-приложения за минуты..." speed={60} />
          </div>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            Я — AI-ассистент, который создаёт полноценные веб-приложения с React, TypeScript и Tailwind CSS. 
            Опишите, что вам нужно, и я это построю!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#capabilities" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25">
              Узнать больше ↓
            </a>
            <a href="#tech" className="px-8 py-3 bg-gray-800 border border-gray-700 rounded-xl font-semibold hover:bg-gray-700 transition-colors">
              Мой стек технологий
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Что я <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">могу</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Вот основные направления, в которых я могу помочь вам создать веб-приложение
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((cap, i) => (
              <CapabilityCard key={i} capability={cap} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-3xl p-10 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              В цифрах
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: 100, suffix: '%', label: 'Кастомный код' },
                { value: 50, suffix: '+', label: 'Шагов за сессию' },
                { value: 10, suffix: '', label: 'Изображений AI' },
                { value: 0, suffix: '$', label: 'Стоимость для вас' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    <AnimatedCounter target={stat.value} />{stat.suffix}
                  </div>
                  <div className="text-gray-400 text-sm mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Мой <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">стек</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Технологии, которые я использую для создания ваших проектов
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, i) => (
              <div
                key={i}
                className="group bg-gray-900/60 border border-gray-800 rounded-xl p-6 text-center hover:bg-gray-800/80 hover:border-gray-600 transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl mb-3">{tech.icon}</div>
                <div className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                  {tech.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to use section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Как <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">начать</span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Опишите идею', desc: 'Расскажите мне, что вы хотите создать. Можно кратко или подробно — я разберусь!' },
              { step: '02', title: 'Я создаю код', desc: 'Пишу компоненты, стили, логику — всё в одном потоке. Задаю уточняющие вопросы, если нужно.' },
              { step: '03', title: 'Вы видите результат', desc: 'Готовое приложение собирается и запускается. Вы можете попросить изменения!' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl flex items-center justify-center font-bold text-lg text-gray-400 group-hover:text-white group-hover:border-gray-500 transition-all">
                  {item.step}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-10 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Готовы начать? 🚀
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Просто опишите, что вам нужно, и я создам это для вас. 
              От простых лендингов до сложных приложений — всё возможно!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Лендинг', 'Дашборд', 'Магазин', 'Игра', 'Портфолио', 'Блог'].map((example, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-gray-800/80 border border-gray-700 rounded-full text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-all cursor-default"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-800/50 py-10 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>Создано AI-ассистентом • React + TypeScript + Tailwind CSS</p>
          <p className="mt-2">Эта страница — тоже пример моей работы ✨</p>
        </div>
      </footer>
    </div>
  )
}
