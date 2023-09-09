import React, {useState } from "react";
import { dogProfileReducer, initialState } from "./dogProfileReducer";
import { InputVetlens } from "../common/InputVetLens";
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Modal } from "react-native";
import { ButtonVetLens } from "../common/ButtonVetLens";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePicker from "react-native-modern-datepicker";
import { getFormatedDate } from "react-native-modern-datepicker";
import { FontAwesome5 } from '@expo/vector-icons'; 
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button";
import * as ImagePicker from 'expo-image-picker';
import vetlenslogo from '../../assets/icons/png/vetlens-logo.png'
import { callBackendAPI } from "../../utils/CommonFunctions";
import * as SecureStore from 'expo-secure-store';

export const DogProfile = ({ route, navigation }) => {
    
    const [image, setImage] = useState();
    const { action, dog } = route.params;
    const [currentImage, setCurrentImage] = useState()
    const [imageChange, setImageChange] = useState(false)
    const [sex, setSex] = useState('MALE');
    const [castrated, setCastrated] = useState(true)
    const [dogProfile, dogProfileDispatch] = React.useReducer(dogProfileReducer, initialState);
    const { name, dogBreed, 
            isNameValid, isDogBreedValid, 
            nameErrorMessage, dogBreedErrorMessage
        } = dogProfile;

    React.useEffect(() => {
        if( action !== 'add') {
            setCurrentImage(dog.photoUrl)
        } else {
            setCurrentImage(vetlenslogo)
        }
        
    }, [])
    
    //DatePicker props & functions
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
    const startDate = getFormatedDate( 
        "2000/01/01", "YYYY-MM-DD"
    );
    const [selectedStartDate, setSelectedStartDate] = useState("Fecha");
    const [startedDate, setStartedDate] = useState("12/12/2023");
    const [isDateValid, setIsDateValid] = useState(true)

    function handleChangeStartDate(propDate) {
        setStartedDate(propDate);
    }

    const handleOnPressStartDate = () => {
        setOpenStartDatePicker(!openStartDatePicker);
    };

    const changeDate = (date) => {
        setIsDateValid(true)
        setSelectedStartDate(date)
    }

    

    const areInputsValid = () => {
        if (name === "")
            dogProfileDispatch({ type: "nameError", error: "No puede dejar este campo vacío" });
        if (dogBreed === "")
            dogProfileDispatch({ type: "dogBreedError", error: "No puede dejar este campo vacío" });
        if (selectedStartDate === "Fecha")
            setIsDateValid(false)
        if (name !== "" && dogBreed !== "" && selectedStartDate !== "Fecha") {
            setIsDateValid(true)
            return true;
        } else {
            return false;
        }
    }

    function formatDate (input) {
        var datePart = input.match(/\d+/g),
        year = datePart[0].substring(2), // get only two digits
        month = datePart[1], day = datePart[2];
      
        return day+'-'+month+'-20'+year;
    }

    const processForm = async () => {
        console.log("ENTRE")
        let dogId; 
        if (areInputsValid()) {
            try{
                const storedUsername = await SecureStore.getItemAsync('username');
                const data = {
                    name: name,
                    dog_breed: dogBreed,
                    date_of_birth: formatDate(selectedStartDate),
                    owner_username: storedUsername,
                    sex: sex,
                    is_castrated: castrated
                }
                const result = await callBackendAPI("/users/dog/add", "POST", data)
                dogId = result.data.id;
                await callBackendAPI(`/users/dog/photo/${dogId}`, "PUT", image, {}, 'multipart/form-data')
            } catch (error) {
                console.log(error)
            }
            
            
        }
    }

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [3, 3],
            quality: 1,
        });  

        if (!result.canceled) {
            const aux = result.uri
            setCurrentImage(result.uri);
            setImageChange(true)
            const data = new FormData();
            const getType = aux.split(".");
            const getFileName = aux.split("/");
            data.append('image', {
                uri: aux,
                type: `image/${getType[getType.length - 1]}`,
                name: getFileName[getFileName.length - 1]
            });
            
            setImage(data)
        }
    }
    return (
        <ScrollView style={styles.container}>
            <SafeAreaView>
                <View style={styles.imagePickerContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image source={(action === 'add' && !imageChange) ?  currentImage : {uri:currentImage} } style={styles.imageProfile} />  
                    </TouchableOpacity>
                </View>
                <View style={styles.formContainer}>
                    <View style={styles.formContainerItem}>
                        <Text style={styles.inputTitle}> Nombre </Text>
                        <InputVetlens
                            placeholder='Nombre'
                            onChange={(text) => dogProfileDispatch({
                                type: "fieldUpdate",
                                field: "name",
                                value: text
                            })}
                            value={name}
                            isValid={isNameValid}
                            errorMessage={nameErrorMessage}
                        />
                    </View>

                    <View style={styles.formContainerItem}>
                        <Text style={styles.inputTitle}> Raza </Text>
                        <InputVetlens
                            placeholder='Raza'
                            onChange={(text) => dogProfileDispatch({
                                type: "fieldUpdate",
                                field: "dogBreed",
                                value: text
                            })}
                            value={dogBreed}
                            isValid={isDogBreedValid}
                            errorMessage={dogBreedErrorMessage}
                        />
                    </View >
                    
                    <View style={{flex:1, flexDirection: 'row', alignItems:'center', justifyContent:'space-between', marginTop: 20}}>
                        <View style={{flex:1, flexDirection: 'column', alignItems:'center'}}>
                            <Text style={styles.inputGroupTitle}> Sexo </Text>
                            <RadioButtonGroup
                                containerStyle={styles.formContainerRadioButtons}
                                selected={sex}
                                onSelected={(value) => setSex(value)}
                                radioBackground="#00A6B0"
                            >
                                
                                <RadioButtonItem value="MALE" label={<Text style={styles.radioButtonText}>Macho</Text>}/>
                                <RadioButtonItem value="FEMALE" label={<Text style={styles.radioButtonText}>Hembra</Text>}/>
                            </RadioButtonGroup>
                        </View>
                        <View style={{flex:1, flexDirection: 'column', alignItems:'center'}}>
                            <Text style={styles.inputGroupTitle}> Castrado </Text>
                            <RadioButtonGroup
                                containerStyle={styles.formContainerRadioButtons}
                                selected={castrated}
                                onSelected={(value) => setCastrated(value)}
                                radioBackground="#00A6B0"
                            >
                                <RadioButtonItem value={true} label={<Text style={styles.radioButtonText}>Si</Text>}/>
                                <RadioButtonItem value={false} label={<Text style={styles.radioButtonText}>No</Text>}/>
                            </RadioButtonGroup>
                        </View>
                    </View>
                    <View style={styles.formContainerItemDate}>
                        <Text style={styles.inputTitle}>Fecha nac.</Text>
                        <TouchableOpacity
                            style={isDateValid ? styles.dateInput : styles.dateInputInvalid}
                            onPress={handleOnPressStartDate}
                        >
                            <Text> {selectedStartDate} </Text>
                            <FontAwesome5 name="calendar-alt" size={20} color={isDateValid ? "#00A6B0" : "#FF6D6D" }/>
                        </TouchableOpacity>
                        {!isDateValid && <Text style={styles.error}>Fecha inválida</Text>}
                    </View>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={openStartDatePicker}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <DatePicker
                                    mode="calendar"
                                    minimumDate={startDate}
                                    selected={startedDate}
                                    onDateChanged={handleChangeStartDate}
                                    onSelectedChange={(date) => changeDate(date)}
                                    options={{
                                        backgroundColor: "#080516",
                                        textHeaderColor: "#00A6B0",
                                        textDefaultColor: "#FFFFFF",
                                        selectedTextColor: "#FFF",
                                        mainColor: "#00A6B0",
                                        textSecondaryColor: "#FFFFFF",
                                        borderColor: "rgba(122, 146, 165, 0.1)",
                                    }}
                                />
                                <TouchableOpacity onPress={handleOnPressStartDate}>
                                <Text style={{ color: "white" }}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    {
                        (action === 'view')
                        ? <></>
                        : 
                        <>
                        <View style={styles.formContainerItem2}>
                            <ButtonVetLens callback={processForm} text={(action === 'add') ? "Agregar" : "Editar"} filled={true} />
                        </View>
                        </>
                    }
                </View>
            </SafeAreaView>
        </ScrollView>
    )
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            resizeMode: 'cover',
            backgroundColor: '#fff',
        },
        image: {
            flex: 1,
            resizeMode: 'cover',
            justifyContent: 'center',
            marginTop: 40,
            width: 200,
            height: 200
        },
        text: {
            fontFamily: "PoppinsSemiBold",
            fontSize: 36,
            paddingBottom: 10,
        },
        textContainer: {
            flex: 1,
            marginTop: 70,
            alignItems: 'center'
        },
        radioButtonText:{
            fontFamily: "PoppinsRegular",
            fontSize: 14,
            color: '#00767D'
        },
        inputTitle:{
            fontFamily: "PoppinsBold",
            fontSize: 15,
            paddingBottom: 4,
            paddingLeft: 8,
            color: '#00767D'
        },
        inputGroupTitle:{
            fontFamily: "PoppinsBold",
            fontSize: 15,
            paddingLeft: 8,
            color: '#00767D'
        },
        dateInputText:{
            fontFamily: "PoppinsBold",
            fontSize: 15,
            color: '#00767D'
        },
        formContainer: {
            flex: 3,
            paddingLeft: 15,
            paddingRight: 15,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            marginBottom: 40,
            marginTop: 35
        },
        formContainerItem: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            marginVertical: 15
        },
        formContainerRadioButtons:{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginVertical: 15,
            height: 65
        },
        formContainerItem2: {
            flex: 3,
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: 65,
            marginBottom: 40
        },
        formContainerItemDate: {
            flex: 1,
            width: '45%',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            marginVertical: 20,
            alignSelf: 'center'
        },
        imagePickerContainer: {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            marginTop: 30
        },
        imageProfile: {
            width: 140,
            height: 140,
            borderRadius: 10
        },
        dateInput:{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: "#F1F0F0",
            borderRadius:10,
            borderColor: "#00A6B0",
            borderWidth:2,
            fontFamily: 'PoppinsRegular',
            fontSize:14,
            padding:15,
            textAlign:"left"
        },
        dateInputInvalid:{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: "#F1F0F0",
            borderRadius:10,
            borderColor: "#FF6D6D",
            borderWidth:2,
            fontFamily: 'PoppinsRegular',
            fontSize:14,
            padding:15,
            textAlign:"left"
        },
        error: {
            color:"#FF6D6D", 
            fontFamily: 'PoppinsSemiBold',
            marginLeft: 10,
            fontSize: 14
        },

        centeredView: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          },
          modalView: {
            margin: 20,
            backgroundColor: "#080516",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            padding: 35,
            width: "90%",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        }

    }
)
