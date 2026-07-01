# =========================
# BUILD STAGE
# =========================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /src

COPY . .

RUN dotnet restore "src/Dump.API/Dump.API.csproj"

RUN dotnet publish "src/Dump.API/Dump.API.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false \
    --no-restore

RUN test -s /app/publish/Dump.API.deps.json

# =========================
# RUNTIME STAGE
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app

RUN mkdir -p /app/storage

COPY --from=build /app/publish .

RUN test -s /app/Dump.API.deps.json

ENV ASPNETCORE_URLS=http://+:10000

EXPOSE 10000

ENTRYPOINT ["dotnet", "Dump.API.dll"]