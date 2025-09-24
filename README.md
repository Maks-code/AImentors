# AImentorsfff


Если добавил/изменил тут чото, то чтобы оно появилось на гитхабе то в терминале вводи:
            git add .
            git commit -m "коммент чо изменил или добавил"
            git push origin main

Запуск сервера бэкенда (ты должен быть в папке backend)
    uvicorn app.main:app --reload
запуск фронта (должен быть в папке frontend)
    npm run dev

запуск виртуальной среды
source venv/bin/activate

запуск докера с редисом
    docker start ai-mentors-redis 

меняем стек на сразу подходящий (уходим от supabase)
    FastAPI + PostgreSQL + SQLAlchemy + Alembic + JWT


Порядок действий:
1. Запуск сервера (uvicorn app.main:app --reload) из папки бэкенд и переход по ссылке из терминала
2. в первой ручке POST register вводишь JSON запрос где отдаешь базе данных инфу по пользователю - получаешь 200 ОК
3. Следующей ручкой идет Логин (то есть вход) где получаем токен пользователя, который говорит нам о том, что пользователь зареганый и у него есть токен
4. далее в терминале прописываем 
    curl -X GET http://127.0.0.1:8000/me \
    -H "Authorization: Bearer (его токен)
5. если получаем инфу по пользователю то все работает


чтобы через терминал тестить ручки вот команды:
ДЛЯ LOGIN: curl -X POST http://127.0.0.1:8000/login \
            -H "Content-Type: application/json" \
            -d '{
                "email": "test@marya.com",
                "password": "123456"
            }' 
получим токен пользователя

ДЛЯ PATCH: curl -X PATCH http://127.0.0.1:8000/me \
            -H "Authorization: Bearer ПОЛУЧЕННЫЙ ТОКЕН" \
            -H "Content-Type: application/json" \
            -d '{
                "full_name": "Марьяна Обновлённая",
                "bio": "Изменилась, но осталась главной героиней"
            }'


запрос чатику и внос в БД: curl -X POST http://127.0.0.1:8000/chat \
                            -H "Content-Type: application/json" \
                            -H "Authorization: Bearer ТОКЕН" \
                            -d '{"prompt": "Кто такой Ньютон?"}'

получить историю СВОИХ запросов (по токену пользователя): 
                                curl -X GET http://127.0.0.1:8000/chat/history \
                                -H "Authorization: Bearer ТОКЕН"



	•	Запуск: docker compose up -d
	•	Пересборка после изменений зависимостей: docker compose up -d --build
	•	Остановка: docker compose down

    проверить чо сейчас запущено: lsof -i :3000
                                  lsof -i :8000