export const campaignTemplates = [
    {
        id: "despertar-del-heroe",
        title: "Despertar del Héroe",
        tagline: "Tu primera semana sin fricción",
        description: "Ruta inicial de 7 días para los que parten desde cero: pocas misiones, hábitos diarios simples y recompensas baratas para agarrar ritmo.",
        duration: "7 días",
        difficulty: "Principiante",
        objectives: [
            {
                title: "Completa tu primera semana",
                description: "Termina las misiones base y mantén tus hábitos 7 días.",
                tasks: [
                    { title: "Ordena tu espacio de trabajo", description: "Escritorio o pieza, 15 minutos.", difficulty: "easy", type: "single" },
                    { title: "Define tus 3 prioridades", description: "Escríbelas en Objetivos.", difficulty: "easy", type: "single" },
                    { title: "Revisión diaria de 5 minutos", description: "Marca tus misiones del día.", difficulty: "normal", type: "daily" }
                ],
                habits: [
                    { title: "Levántate sin snooze", description: "Un día a la vez.", difficulty: "easy", frequency: "daily" },
                    { title: "10 minutos de orden", description: "Deja un lugar mejor que ayer.", difficulty: "easy", frequency: "daily" }
                ]
            }
        ],
        rewards: [
            { title: "Capítulo de serie o anime", description: "20-30 min de descanso.", cost: 30 },
            { title: "Snack favorito", description: "Date un gusto.", cost: 20 },
            { title: "Siesta heroica (20 min)", description: "Recarga sin pasarte.", cost: 25 },
            { title: "Playlist + caminata corta", description: "15 min de aire libre.", cost: 15 }
        ]
    },
    {
        id: "forja-del-cuerpo",
        title: "Forja del Cuerpo",
        tagline: "Salud y energía de acero",
        description: "Ruta de 14 días para mover el cuerpo, dormir mejor y tomar agua. Ideal si quieres constancia sin matarte en el gimnasio.",
        duration: "14 días",
        difficulty: "Intermedio",
        objectives: [
            {
                title: "Cuerpo en marcha",
                description: "Movimiento diario + base de sueño e hidratación.",
                tasks: [
                    { title: "Caminata de 20 minutos", description: "Sin excusas, a tu ritmo.", difficulty: "normal", type: "daily" },
                    { title: "Prepara tu botella de agua", description: "Déjala lista cada mañana.", difficulty: "easy", type: "daily" },
                    { title: "Chequeo semanal de energía", description: "¿Dormiste y te moviste la mayoría de días?", difficulty: "normal", type: "weekly" }
                ],
                habits: [
                    { title: "Beber 6 vasos de agua", description: "Hidratación base.", difficulty: "normal", frequency: "daily" },
                    { title: "Dormir antes de las 00:00", description: "Pantallas fuera 30 min antes.", difficulty: "hard", frequency: "daily" },
                    { title: "Mover el cuerpo 3 veces por semana", description: "Caminar, bici o entrenar.", difficulty: "normal", frequency: "weekly", weeklyTarget: 3 }
                ]
            }
        ],
        rewards: [
            { title: "Baño largo / ducha premium", description: "Recuperación del héroe.", cost: 40 },
            { title: "Comida trampa", description: "Una en 14 días.", cost: 80 },
            { title: "Smoothie o jugo natural", description: "Premio fresco post-entreno.", cost: 35 },
            { title: "Noche de película tranqui", description: "Manta + algo rico.", cost: 60 }
        ]
    },
    {
        id: "sabio-arcano",
        title: "Sabio Arcano",
        tagline: "Estudio y foco profundo",
        description: "Ruta de 21 días para estudiantes u opositores: sesiones de foco, repaso y lectura. Cópiala y ajusta los tiempos a tu realidad.",
        duration: "21 días",
        difficulty: "Avanzado",
        objectives: [
            {
                title: "Templo del conocimiento",
                description: "Foco diario y repaso semanal de lo aprendido.",
                tasks: [
                    { title: "Sesión de foco de 25 minutos", description: "Pomodoro sin celular.", difficulty: "normal", type: "daily" },
                    { title: "Resumen semanal de apuntes", description: "Una página con lo clave.", difficulty: "hard", type: "weekly" },
                    { title: "Ordena tu material de estudio", description: "Solo una vez al copiar la ruta.", difficulty: "easy", type: "single" }
                ],
                habits: [
                    { title: "Leer 15 páginas", description: "Libro o apuntes.", difficulty: "normal", frequency: "daily" },
                    { title: "Repasar flashcards", description: "10 minutos.", difficulty: "normal", frequency: "daily" },
                    { title: "2 sesiones profundas por semana", description: "90 min sin interrupciones.", difficulty: "hard", frequency: "weekly", weeklyTarget: 2 }
                ]
            }
        ],
        rewards: [
            { title: "Tarde libre de videojuegos", description: "2 horas sin culpa.", cost: 100 },
            { title: "Café especial fuera", description: "Celebra la semana.", cost: 50 },
            { title: "1 capítulo de serie favorita", description: "Desconexión de 40 min.", cost: 70 },
            { title: "Chocolate o dulce", description: "Pequeño premio de foco.", cost: 30 }
        ]
    }
]
