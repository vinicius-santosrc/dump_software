#!/bin/bash

# ============================================
# Dump Mongo Migration Generator
# ============================================

# Usage:
# ./create-migration.sh AddUserThumbnail
#
# Output:
# 202605071530_AddUserThumbnail.cs
# ============================================

if [ -z "$1" ]; then
  echo "Migration name is required."
  echo ""
  echo "Usage:"
  echo "./create-migration.sh AddUserThumbnail"
  exit 1
fi

NAME=$1
TIMESTAMP=$(date +"%Y%m%d%H%M")
CLASS_NAME="${NAME}"
FILE_NAME="${TIMESTAMP}_${NAME}.cs"

MIGRATIONS_PATH="./"

mkdir -p "$MIGRATIONS_PATH"

cat > "$MIGRATIONS_PATH/$FILE_NAME" <<EOF
using MongoDB.Driver;

namespace Dump.Infrastructure.Persistence.Mongo.Migrations
{
    public class ${CLASS_NAME} : IMigration
    {
        public string Version => "${TIMESTAMP}";
        public string Name => "${NAME}";

        public async Task Up(IMongoDatabase database)
        {
            // ============================================
            // Write your migration here
            // ============================================

            // Example:
            //
            // var users = database.GetCollection<User>("users");
            //
            // await users.UpdateManyAsync(
            //     Builders<User>.Filter.Empty,
            //     Builders<User>.Update.Set(x => x.Thumbnail, "")
            // );

        }
    }
}
EOF

echo ""
echo "Migration created successfully:"
echo "$MIGRATIONS_PATH/$FILE_NAME"
echo ""