FROM node:18

# Cài nginx
RUN apt update && apt install -y nginx

# Tạo thư mục làm việc
WORKDIR /app

# Copy mã nguồn
COPY . .

# Cài đặt dependency
RUN npm install

# Copy config nginx
COPY nginx/default.conf /etc/nginx/sites-enabled/default

# Cổng mặc định mà Fly sẽ expose
EXPOSE 8080

# Chạy nginx + app
CMD bash -c "service nginx start && node server.js"
