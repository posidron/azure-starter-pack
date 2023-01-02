class ApiException(Exception):
    """
    Generic API Exception
    """

    def __init__(self, *, status_code: int, code: str, description: str) -> None:
        """
        API exception constructor
        Args:
            status_code (int): HTTP status code
            code (str): Error code
            description (str): Error description
        """
        self.status_code = status_code
        self.code = code
        self.description = description
