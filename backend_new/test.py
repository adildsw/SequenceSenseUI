from cProfile import label
import os
import shutil
import json

# current_directory = os.getcwd()
# print(current_directory)
# final_directory = os.path.join("", 'gesture_report')
# if not os.path.exists(final_directory):
#    os.makedirs(final_directory)
# #    shutil.copy("data/__finalized_model.sav", final_directory+"/model.sav")



# model = {}
# model['name'] = "K-Nearest Neighbors"
# model['input_dimension'] = "400 samples (2 seconds) x 6 features"
# model["features"] = "3D distance and 3D orientation"
# model["k"] = "5"
# model["similarity_measure"] = "Dynamic Time Warping (DTW)"
# model["library"] = "Tslearn"

# with open("gesture_report/model_meta.json", "w", encoding='utf-8') as outfile:
#     json.dump(model, outfile, ensure_ascii=False, indent=4)




# import joblib

# loaded_model = joblib.load("./data/__finalized_model.sav")


# joblib.dump(loaded_model, "./gesture_report/model.sav")   


# import matplotlib.pyplot as plt

# x_axis = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
# y_axis = [5, 16, 34, 56, 32, 56, 32, 12, 76, 89]
# y_axis2 = [10, 19, 29, 40, 20, 40, 12, 60, 100, 110]

# plt.title("Prices over 10 years")
# plt.plot(x_axis, y_axis, color='darkgreen', marker='x', label='height')
# plt.plot(x_axis, y_axis2, color='darkred', marker='o', label='Price')

# ax = plt.gca()
# plt.xlabel("Time (years)")
# plt.ylabel("Price (dollars)")
# ax.set_xlim(0, 11)
# ax.set_ylim(0, 110)
# plt.grid(True)
# plt.legend(fontsize=10)
# plt.savefig("./gesture_report/graph.png")
# plt.show()
folder_name = "gesture_report"

final_directory = os.path.join(folder_name, "gestures_details")
if not os.path.exists(final_directory):
    os.makedirs(final_directory)

# directory = "./"+folder_name+"/"