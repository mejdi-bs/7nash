FROM nginx:alpine
COPY snake-game /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
