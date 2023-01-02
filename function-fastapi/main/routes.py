import random
import typing

import fastapi

router = fastapi.APIRouter()


@router.get("/generate")
async def generate(
    starts_with: str = None,
    subscription_key: typing.Union[str, None] = fastapi.Query(
        default=None, alias="subscription-key"
    ),
):
    names = [
        "Alice",
        "Bob",
        "Charlie",
        "Diana",
        "Eve",
        "Frank",
        "Grace",
        "Heidi",
        "Ivan",
    ]
    if starts_with:
        names = [name for name in names if name.lower().startswith(starts_with)]
    random_name = random.choice(names)
    return {"name": random_name}
