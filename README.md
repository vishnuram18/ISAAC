🚀 Isaac's SmartShop: Microservices E-Commerce
A modern, full-stack e-commerce application built with a Microservices Architecture. This project demonstrates service-to-service communication, centralized routing, and a responsive frontend.

🏗️ Architecture Overview
The system consists of several independent services coordinated by a central Gateway:

Frontend: Next.js 14 (App Router) with Tailwind CSS.

API Gateway: Spring Cloud Gateway (Port 8080) - The entry point for all requests.

Discovery Server: Netflix Eureka (Port 8761) - Service registry.

Product Service: Java/Spring Boot (Port 8081) - Manages the product catalog and MySQL inventory.

Order Service: Java/Spring Boot (Port 8082) - Processes customer orders and saves them to a dedicated database.


[ Next.js Frontend ]  --> [ API Gateway (8080) ]
                                 |
        -------------------------------------------------
        |                                               |
[ Product Service (8081) ]              [ Order Service (8082) ]
        |                                               |
[ MySQL: smartshop_products ]           [ MySQL: smartshop_orders ]
