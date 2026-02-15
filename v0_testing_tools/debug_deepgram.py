import deepgram
import pkgutil


def find_class_in_package(package, class_name):
    print(f"Searching for {class_name} in {package.__name__}...")

    # Check top level
    if hasattr(package, class_name):
        print(f"Found {class_name} in {package.__name__}")
        return True

    # Check submodules
    for loader, module_name, is_pkg in pkgutil.walk_packages(
        package.__path__, package.__name__ + "."
    ):
        try:
            module = __import__(module_name, fromlist=[class_name])
            if hasattr(module, class_name):
                print(f"Found {class_name} in {module_name}")
                return True
        except ImportError:
            continue

    print(f"Could not find {class_name}")
    return False


find_class_in_package(deepgram, "LiveTranscriptionEvents")
find_class_in_package(deepgram, "LiveOptions")
find_class_in_package(deepgram, "Microphone")
find_class_in_package(deepgram, "DeepgramClient")
